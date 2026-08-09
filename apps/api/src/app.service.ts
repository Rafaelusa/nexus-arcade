import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthStatus() {
    let dbStatus = 'connected';
    let stats = { users: 0, platforms: 0, games: 0 };

    try {
      const [userCount, platformCount, gameCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.platform.count(),
        this.prisma.game.count(),
      ]);

      stats = {
        users: userCount,
        platforms: platformCount,
        games: gameCount,
      };
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: 'online',
      service: 'Nexus Arcade API Core',
      version: '0.2.0-sprint2',
      timestamp: new Date().toISOString(),
      database: {
        provider: 'PostgreSQL (Prisma ORM)',
        status: dbStatus,
        stats,
      },
      architecture: 'Monorepo Full Stack (NestJS + Angular)',
    };
  }
}
