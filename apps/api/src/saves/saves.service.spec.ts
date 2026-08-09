import { Test, TestingModule } from '@nestjs/testing';
import { SavesService } from './saves.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('SavesService', () => {
  let service: SavesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    saveState: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavesService>(SavesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('upsertSaveState', () => {
    it('deve criar um novo save state se não existir no slot', async () => {
      mockPrismaService.saveState.findFirst.mockResolvedValue(null);
      mockPrismaService.saveState.create.mockResolvedValue({
        id: 'save-1',
        userId: 'user-1',
        gameId: 'game-1',
        slotIndex: 1,
      });

      const result = await service.upsertSaveState('user-1', {
        gameId: 'game-1',
        slotNumber: 1,
        stateData: 'base64_data',
      });

      expect(result.id).toBe('save-1');
      expect(mockPrismaService.saveState.create).toHaveBeenCalled();
    });

    it('deve atualizar o save state existente se o slot já for ocupado', async () => {
      mockPrismaService.saveState.findFirst.mockResolvedValue({
        id: 'existing-save',
        userId: 'user-1',
        gameId: 'game-1',
        slotIndex: 1,
      });
      mockPrismaService.saveState.update.mockResolvedValue({
        id: 'existing-save',
        storageKey: 'new_base64_data',
      });

      const result = await service.upsertSaveState('user-1', {
        gameId: 'game-1',
        slotNumber: 1,
        stateData: 'new_base64_data',
      });

      expect(result.storageKey).toBe('new_base64_data');
      expect(mockPrismaService.saveState.update).toHaveBeenCalled();
    });
  });

  describe('deleteSaveState', () => {
    it('deve lançar UnauthorizedException se o save pertencer a outro usuário', async () => {
      mockPrismaService.saveState.findUnique.mockResolvedValue({
        id: 'save-1',
        userId: 'outro-user',
      });

      await expect(service.deleteSaveState('user-1', 'save-1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
