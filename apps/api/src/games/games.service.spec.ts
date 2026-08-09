import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let prisma: PrismaService;
  let storageService: StorageService;

  const mockPrismaService = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    platform: {
      findUnique: jest.fn(),
    },
  };

  const mockStorageService = {
    saveRom: jest.fn().mockResolvedValue({
      storageKey: 'rom_123.sfc',
      fileSizeBytes: 1024,
      sha256Hash: 'abc123hash',
    }),
    saveCover: jest.fn().mockResolvedValue({
      storageKey: 'cover_123.png',
      relativeUrl: '/storage/covers/cover_123.png',
    }),
    deleteRom: jest.fn().mockResolvedValue(undefined),
    deleteCover: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um jogo se a plataforma existir', async () => {
      mockPrismaService.platform.findUnique.mockResolvedValue({ id: 'plat-snes', code: 'snes' });
      mockPrismaService.game.create.mockResolvedValue({
        id: 'game-1',
        title: 'Super Mario World',
        platformId: 'plat-snes',
      });

      const result = await service.create(
        {
          title: 'Super Mario World',
          description: 'Jogo de plataforma',
          platformId: 'plat-snes',
        },
        'admin-1',
      );

      expect(result.title).toBe('Super Mario World');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'ADMIN_CREATED_GAME',
        'Game',
        'game-1',
        expect.any(Object),
      );
    });

    it('deve lançar NotFoundException se a plataforma não existir', async () => {
      mockPrismaService.platform.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            title: 'Jogo Fantasma',
            description: 'Desc',
            platformId: 'invalida',
          },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadRom', () => {
    it('deve salvar arquivo binário, calcular hash SHA-256 e atualizar metadados da ROM no banco', async () => {
      const mockFile = {
        originalname: 'mario.sfc',
        buffer: Buffer.from('rom_content'),
        size: 1024,
      } as Express.Multer.File;

      mockPrismaService.game.findUnique.mockResolvedValue({
        id: 'game-1',
        title: 'Super Mario World',
        romStorageKey: null,
      });

      mockPrismaService.game.update.mockResolvedValue({
        id: 'game-1',
        title: 'Super Mario World',
        romStorageKey: 'rom_123.sfc',
        romSize: 1024,
        romHash: 'abc123hash',
      });

      const result = await service.uploadRom('game-1', mockFile, 'admin-1');

      expect(result.romStorageKey).toBe('rom_123.sfc');
      expect(result.romHash).toBe('abc123hash');
      expect(mockStorageService.saveRom).toHaveBeenCalledWith(mockFile);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'ADMIN_UPLOADED_GAME_ROM',
        'Game',
        'game-1',
        expect.any(Object),
      );
    });
  });
});
