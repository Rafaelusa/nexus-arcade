import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';

@Injectable()
export class PlatformsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(onlyActive = false) {
    const where = onlyActive ? { isActive: true } : {};

    return this.prisma.platform.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });
  }

  async findOne(idOrCode: string) {
    const platform = await this.prisma.platform.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });

    if (!platform) {
      throw new NotFoundException(`Plataforma "${idOrCode}" não foi encontrada.`);
    }

    return platform;
  }

  async create(dto: CreatePlatformDto, adminUserId: string) {
    const existing = await this.prisma.platform.findUnique({
      where: { code: dto.code.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Já existe uma plataforma com o código "${dto.code}".`);
    }

    const platform = await this.prisma.platform.create({
      data: {
        name: dto.name,
        code: dto.code.toLowerCase(),
        description: dto.description,
        iconUrl: dto.iconUrl,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_CREATED_PLATFORM', 'Platform', platform.id, {
      code: platform.code,
      name: platform.name,
    });

    return platform;
  }

  async update(id: string, dto: UpdatePlatformDto, adminUserId: string) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.platform.findFirst({
        where: { code: dto.code.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`O código "${dto.code}" já pertence a outra plataforma.`);
      }
    }

    const updated = await this.prisma.platform.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code ? dto.code.toLowerCase() : undefined,
        description: dto.description,
        iconUrl: dto.iconUrl,
        isActive: dto.isActive,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPDATED_PLATFORM', 'Platform', updated.id);

    return updated;
  }

  async delete(id: string, adminUserId: string) {
    const platform = await this.findOne(id);

    if (platform._count.games > 0) {
      throw new BadRequestException(
        `Operação negada: A plataforma "${platform.name}" contém ${platform._count.games} jogo(s) cadastrado(s). Exclua os jogos vinculados antes de remover a plataforma.`
      );
    }

    await this.prisma.platform.delete({ where: { id } });

    await this.auditService.logAction(adminUserId, 'ADMIN_DELETED_PLATFORM', 'Platform', id, {
      deletedName: platform.name,
    });

    return { message: `Plataforma "${platform.name}" foi removida com sucesso.` };
  }
}
