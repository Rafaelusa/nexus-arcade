import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../database/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    gameSession: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userGame: {
      count: jest.fn(),
    },
    saveState: {
      count: jest.fn(),
    },
    game: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getUserStats', () => {
    it('deve calcular estatísticas agregadas de tempo de jogo em minutos do usuário', async () => {
      mockPrismaService.gameSession.aggregate.mockResolvedValue({
        _sum: { durationSeconds: 600 },
        _count: { id: 3 },
      });
      mockPrismaService.userGame.count.mockResolvedValue(2);
      mockPrismaService.saveState.count.mockResolvedValue(4);
      mockPrismaService.gameSession.findMany.mockResolvedValue([]);

      const stats = await service.getUserStats('user-1');

      expect(stats.totalPlaytimeMinutes).toBe(10);
      expect(stats.totalSessionsCount).toBe(3);
      expect(stats.favoriteGamesCount).toBe(2);
      expect(stats.saveStatesCount).toBe(4);
    });
  });
});
