import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    user: { count: jest.fn().mockResolvedValue(1) },
    platform: { count: jest.fn().mockResolvedValue(1) },
    game: { count: jest.fn().mockResolvedValue(1) },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('deve retornar o status de saúde e diagnostico da aplicação', async () => {
      const response = await appController.getHealth();
      expect(response.status).toBe('online');
      expect(response.service).toBe('Nexus Arcade API Core');
      expect(response.database.status).toBe('connected');
    });
  });
});
