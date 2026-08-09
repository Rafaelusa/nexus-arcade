import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    platformId?: string,
    platformCode?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.GameWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (platformId) {
      where.platformId = platformId;
    } else if (platformCode) {
      where.platform = { code: platformCode.toLowerCase() };
    }

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              code: true,
              iconUrl: true,
            },
          },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      data: games,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Jogo com ID "${id}" não foi encontrado.`);
    }

    return game;
  }

  async create(dto: CreateGameDto, adminUserId: string) {
    const platform = await this.prisma.platform.findUnique({
      where: { id: dto.platformId },
    });

    if (!platform) {
      throw new NotFoundException(`Plataforma com ID "${dto.platformId}" não existe.`);
    }

    const defaultCoversByPlatform: Record<string, string> = {
      snes: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
      gba: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      nes: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
      megadrive: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
      gb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      gbc: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    };

    const fallbackCover =
      defaultCoversByPlatform[platform.code.toLowerCase()] ||
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop';

    const finalCoverUrl = dto.coverUrl && dto.coverUrl.trim() !== '' ? dto.coverUrl.trim() : fallbackCover;

    const game = await this.prisma.game.create({
      data: {
        title: dto.title,
        description: dto.description,
        platformId: dto.platformId,
        coverUrl: finalCoverUrl,
        releaseYear: dto.releaseYear,
        developer: dto.developer,
        publisher: dto.publisher,
      },
      include: {
        platform: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_CREATED_GAME', 'Game', game.id, {
      title: game.title,
      platformCode: platform.code,
    });

    return game;
  }

  async update(id: string, dto: UpdateGameDto, adminUserId: string) {
    await this.findOne(id);

    if (dto.platformId) {
      const platform = await this.prisma.platform.findUnique({
        where: { id: dto.platformId },
      });
      if (!platform) {
        throw new NotFoundException(`Plataforma com ID "${dto.platformId}" não existe.`);
      }
    }

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: dto,
      include: {
        platform: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPDATED_GAME', 'Game', id, {
      updatedFields: Object.keys(dto),
    });

    return updatedGame;
  }

  async remove(id: string, adminUserId: string) {
    const game = await this.findOne(id);

    if (game.romStorageKey) {
      await this.storageService.deleteRom(game.romStorageKey);
    }
    if (game.coverUrl && game.coverUrl.startsWith('/storage/covers/')) {
      await this.storageService.deleteCover(game.coverUrl.replace('/storage/covers/', ''));
    }

    await this.prisma.game.delete({
      where: { id },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_DELETED_GAME', 'Game', id, {
      title: game.title,
    });

    return { message: `Jogo "${game.title}" removido com sucesso.` };
  }

  async delete(id: string, adminUserId: string) {
    return this.remove(id, adminUserId);
  }

  async uploadCover(id: string, file: Express.Multer.File, adminUserId: string) {
    const game = await this.findOne(id);

    if (game.coverUrl && game.coverUrl.startsWith('/storage/covers/')) {
      await this.storageService.deleteCover(game.coverUrl.replace('/storage/covers/', ''));
    }

    const savedPath = await this.storageService.saveCover(file);

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: { coverUrl: savedPath.relativeUrl },
      include: { platform: true },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPLOADED_GAME_COVER', 'Game', id, {
      coverUrl: savedPath.relativeUrl,
    });

    return updatedGame;
  }

  async uploadRom(id: string, file: Express.Multer.File, adminUserId: string) {
    const game = await this.findOne(id);

    if (game.romStorageKey) {
      await this.storageService.deleteRom(game.romStorageKey);
    }

    const romMetadata = await this.storageService.saveRom(file);

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: {
        romStorageKey: romMetadata.storageKey,
        romHash: romMetadata.sha256Hash,
        romSize: romMetadata.fileSizeBytes,
      },
      include: { platform: true },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPLOADED_GAME_ROM', 'Game', id, {
      romHash: romMetadata.sha256Hash,
      romSize: romMetadata.fileSizeBytes,
    });

    return updatedGame;
  }
}
