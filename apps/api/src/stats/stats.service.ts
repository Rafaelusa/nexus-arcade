import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [totalSessions, userGamesCount, saveStatesCount, recentSessions] = await Promise.all([
      this.prisma.gameSession.aggregate({
        where: { userId },
        _sum: { durationSeconds: true },
        _count: { id: true },
      }),
      this.prisma.userGame.count({
        where: { userId, isFavorite: true },
      }),
      this.prisma.saveState.count({
        where: { userId },
      }),
      this.prisma.gameSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
          game: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              platform: {
                select: { code: true, name: true },
              },
            },
          },
        },
      }),
    ]);

    const totalSeconds = totalSessions._sum.durationSeconds || 0;
    const totalMinutes = Math.floor(totalSeconds / 60);

    return {
      totalPlaytimeMinutes: totalMinutes,
      totalSessionsCount: totalSessions._count.id,
      favoriteGamesCount: userGamesCount,
      saveStatesCount,
      recentSessions,
    };
  }

  async startSession(userId: string, gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException(`Jogo com ID "${gameId}" não existe.`);
    }

    return this.prisma.gameSession.create({
      data: {
        userId,
        gameId,
        startedAt: new Date(),
      },
      include: {
        game: true,
      },
    });
  }

  async endSession(sessionId: string, durationSeconds?: number) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Sessão de jogo "${sessionId}" não encontrada.`);
    }

    const endedAt = new Date();
    const calculatedDuration = durationSeconds || Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

    return this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        durationSeconds: Math.max(0, calculatedDuration),
      },
    });
  }
}
