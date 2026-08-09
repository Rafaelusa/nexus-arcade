import { Injectable, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Verificar unicidade de email e username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Este endereço de e-mail já está em uso.');
      }
      if (existingUser.username === dto.username) {
        throw new ConflictException('Este nome de usuário já está em uso.');
      }
    }

    // 2. Hash da senha com Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    // 3. Criar usuário com papel padrão GAMER
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: UserRole.GAMER,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${dto.username}`,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // 4. Gerar tokens JWT (8 horas de expiração)
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // 1. Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Mensagem padronizada contra enunciação de usuários
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha incorretos.');
    }

    // Mensageria detalhada para conta bloqueada por Admin
    if (user.isBlocked) {
      throw new ForbiddenException('Esta conta de usuário foi bloqueada por um Administrador. Entre em contato com o suporte.');
    }

    // Verificar hash da senha com Argon2id
    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuário ou senha incorretos.');
    }

    // Gerar tokens JWT com sessão de 8 horas de expiração
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET || 'super_secret_nexus_jwt_key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, isBlocked: true },
      });

      if (!user || user.isBlocked) {
        throw new UnauthorizedException('Sessão inválida ou expirada');
      }

      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '8h' },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Mensagem genérica segura padronizada anti-enumeração
    if (!user || user.isBlocked) {
      return {
        message: 'Se o e-mail informado estiver cadastrado, um link seguro de redefinição de senha foi gerado.',
        sentRealEmail: false,
      };
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'password_reset' },
      { expiresIn: '15m' },
    );

    // Disparar e-mail através do Robô MailService
    const mailResult = await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: mailResult.sentRealEmail
        ? 'Um e-mail de redefinição de senha foi enviado com sucesso para sua caixa de entrada!'
        : 'Se o e-mail informado estiver cadastrado, o link seguro de redefinição de senha foi gerado.',
      sentRealEmail: mailResult.sentRealEmail,
      devResetUrl: `http://localhost:4200/reset-password?token=${resetToken}`,
      resetToken,
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(resetToken, {
        secret: process.env.JWT_SECRET || 'super_secret_nexus_jwt_key',
      });

      if (payload.purpose !== 'password_reset') {
        throw new BadRequestException('Token de redefinição inválido.');
      }

      const newPasswordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
      });

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: newPasswordHash },
      });

      return { message: 'Senha redefinida com sucesso com criptografia Argon2id!' };
    } catch (error) {
      throw new BadRequestException('Token de redefinição expirado ou inválido.');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '8h' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
