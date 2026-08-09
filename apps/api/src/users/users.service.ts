import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    role?: UserRole,
    isBlocked?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          avatarUrl: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não foi encontrado.`);
    }

    return user;
  }

  async create(dto: CreateUserDto, adminUserId: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Este e-mail já está cadastrado.');
      }
      if (existing.username === dto.username) {
        throw new ConflictException('Este username já está em uso.');
      }
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: dto.role || UserRole.GAMER,
        avatarUrl: dto.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.username}`,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_CREATED_USER', 'User', user.id, {
      createdEmail: user.email,
      createdRole: user.role,
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, adminUserId: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário com ID "${id}" não foi encontrado.`);
    }

    // Regra do Último Admin: Se estiver mudando role de ADMIN para GAMER
    if (targetUser.role === UserRole.ADMIN && dto.role === UserRole.GAMER) {
      const activeAdminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isBlocked: false },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Operação negada: Não é possível remover privilégios do único Administrador ativo do sistema.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        username: dto.username,
        role: dto.role,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        isBlocked: true,
        updatedAt: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPDATED_USER', 'User', updatedUser.id, {
      updatedFields: Object.keys(dto),
    });

    return updatedUser;
  }

  async toggleBlock(id: string, adminUserId: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário com ID "${id}" não foi encontrado.`);
    }

    // Se estiver tentando BLOQUEAR um ADMIN, checar se é o único Admin ativo
    if (!targetUser.isBlocked && targetUser.role === UserRole.ADMIN) {
      const activeAdminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isBlocked: false },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Operação negada: Não é possível bloquear o único Administrador ativo do sistema.');
      }
    }

    const newBlockState = !targetUser.isBlocked;

    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: newBlockState },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBlocked: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_TOGGLED_BLOCK', 'User', user.id, {
      isBlocked: newBlockState,
    });

    return user;
  }

  async delete(id: string, adminUserId: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário com ID "${id}" não foi encontrado.`);
    }

    // Regra do Último Admin: Impedir exclusão se for ADMIN e for o único Admin existente
    if (targetUser.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Operação negada: Não é possível excluir o único Administrador do sistema. Cadastre outro Administrador antes.');
      }
    }

    await this.prisma.user.delete({ where: { id } });

    await this.auditService.logAction(adminUserId, 'ADMIN_DELETED_USER', 'User', id, {
      deletedEmail: targetUser.email,
    });

    return { message: `Usuário "${targetUser.username}" (${targetUser.email}) foi removido com sucesso.` };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (existing) {
        throw new ConflictException('Este nome de usuário já está em uso por outra conta.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    await this.auditService.logAction(userId, 'USER_UPDATED_PROFILE', 'User', userId);

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('A senha atual fornecida está incorreta.');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await this.auditService.logAction(userId, 'USER_CHANGED_PASSWORD', 'User', userId);

    return { message: 'Sua senha foi alterada com sucesso.' };
  }
}
