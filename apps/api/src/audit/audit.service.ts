import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string | null,
    metadata?: Record<string, any>,
  ) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId: resourceId || null,
          metadata: metadata ? metadata : undefined,
        },
      });
    } catch (error) {
      console.error('[AuditService] Erro ao registrar log de auditoria:', error);
    }
  }

  async findAll(page = 1, limit = 20, actionFilter?: string) {
    const skip = (page - 1) * limit;

    const where = actionFilter
      ? { action: { contains: actionFilter, mode: 'insensitive' as const } }
      : {};

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
