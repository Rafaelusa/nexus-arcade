import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuditService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-log-id' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('deve bloquear a exclusão se o usuário for o único ADMINISTRADOR do sistema (Proteção do Último Admin)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@nexus.local',
        role: UserRole.ADMIN,
      });
      mockPrismaService.user.count.mockResolvedValue(1); // Apenas 1 Admin

      await expect(service.delete('admin-1', 'admin-1')).rejects.toThrow(BadRequestException);
    });

    it('deve permitir excluir o Admin se houver mais de um Admin cadastrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-2',
        email: 'admin2@nexus.local',
        username: 'admin2',
        role: UserRole.ADMIN,
      });
      mockPrismaService.user.count.mockResolvedValue(2); // 2 Admins
      mockPrismaService.user.delete.mockResolvedValue({});

      const result = await service.delete('admin-2', 'admin-1');

      expect(result.message).toContain('removido com sucesso');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'ADMIN_DELETED_USER',
        'User',
        'admin-2',
        expect.any(Object),
      );
    });
  });

  describe('toggleBlock', () => {
    it('deve impedir o bloqueio se o Admin for o único ativo', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: UserRole.ADMIN,
        isBlocked: false,
      });
      mockPrismaService.user.count.mockResolvedValue(1); // 1 Admin ativo

      await expect(service.toggleBlock('admin-1', 'admin-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('deve alterar a senha com sucesso quando a senha atual estiver correta', async () => {
      const currentHash = await argon2.hash('SenhaAntiga123!', { type: argon2.argon2id });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: currentHash,
      });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.changePassword('user-1', {
        currentPassword: 'SenhaAntiga123!',
        newPassword: 'NovaSenhaSegura456!',
      });

      expect(result.message).toContain('alterada com sucesso');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'user-1',
        'USER_CHANGED_PASSWORD',
        'User',
        'user-1',
      );
    });

    it('deve lançar UnauthorizedException se a senha atual for incorreta', async () => {
      const currentHash = await argon2.hash('SenhaAntiga123!', { type: argon2.argon2id });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: currentHash,
      });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'SenhaErrada!',
          newPassword: 'NovaSenhaSegura456!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
