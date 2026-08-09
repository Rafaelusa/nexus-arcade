import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConflictException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
    verifyAsync: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendAccountStatusNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário GAMER e retornar o perfil com tokens JWT', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'uuid-123',
        email: 'gamer@nexus.local',
        username: 'gamer123',
        role: 'GAMER',
        avatarUrl: 'https://avatar.url',
        createdAt: new Date(),
      });

      const result = await service.register({
        email: 'gamer@nexus.local',
        username: 'gamer123',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('gamer@nexus.local');
      expect(result.user.role).toBe('GAMER');
      expect(result.accessToken).toBe('mocked_jwt_token');
      expect(result.refreshToken).toBe('mocked_jwt_token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o e-mail já estiver cadastrado', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ email: 'gamer@nexus.local' });

      await expect(
        service.register({
          email: 'gamer@nexus.local',
          username: 'outro_user',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve autenticar usuário válido com senha Argon2id correta', async () => {
      const hashedPassword = await argon2.hash('Admin123!NexusArcade', { type: argon2.argon2id });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-admin',
        email: 'admin@nexus.local',
        username: 'admin',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isBlocked: false,
      });

      const result = await service.login({
        email: 'admin@nexus.local',
        password: 'Admin123!NexusArcade',
      });

      expect(result.user.email).toBe('admin@nexus.local');
      expect(result.accessToken).toBe('mocked_jwt_token');
    });

    it('deve lançar UnauthorizedException se a senha for incorreta', async () => {
      const hashedPassword = await argon2.hash('SenhaCerta', { type: argon2.argon2id });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-user',
        email: 'user@nexus.local',
        passwordHash: hashedPassword,
        isBlocked: false,
      });

      await expect(
        service.login({
          email: 'user@nexus.local',
          password: 'SenhaErrada',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar ForbiddenException se a conta estiver bloqueada por admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-blocked',
        email: 'blocked@nexus.local',
        isBlocked: true,
      });

      await expect(
        service.login({
          email: 'blocked@nexus.local',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('forgotPassword & resetPassword', () => {
    it('deve gerar token de redefinição se o e-mail existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'user@nexus.local',
        isBlocked: false,
      });

      const result = await service.forgotPassword('user@nexus.local');
      expect(result.resetToken).toBe('mocked_jwt_token');
    });

    it('deve redefinir senha com sucesso quando o token de recuperação é valido', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'uuid-1',
        purpose: 'password_reset',
      });
      mockPrismaService.user.update.mockResolvedValue({ id: 'uuid-1' });

      const result = await service.resetPassword('valid_token', 'NovaSenha123!');
      expect(result.message).toContain('Senha redefinida com sucesso');
    });
  });
});
