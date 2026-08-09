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

    const game = await this.prisma.game.create({
      data: {
        title: dto.title,
        description: dto.description,
        platformId: dto.platformId,
        coverUrl: dto.coverUrl,
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
      data: {
        title: dto.title,
        description: dto.description,
        platformId: dto.platformId,
        coverUrl: dto.coverUrl,
        releaseYear: dto.releaseYear,
        developer: dto.developer,
        publisher: dto.publisher,
      },
      include: {
        platform: true,
      },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPDATED_GAME', 'Game', updatedGame.id);

    return updatedGame;
  }

  async delete(id: string, adminUserId: string) {
    const game = await this.findOne(id);

    // Limpar arquivo de ROM do disco se existir
    if (game.romStorageKey) {
      await this.storageService.deleteRom(game.romStorageKey);
    }

    await this.prisma.game.delete({ where: { id } });

    await this.auditService.logAction(adminUserId, 'ADMIN_DELETED_GAME', 'Game', id, {
      deletedTitle: game.title,
    });

    return { message: `Jogo "${game.title}" e seus arquivos binários foram excluídos com sucesso.` };
  }

  async uploadCover(id: string, file: Express.Multer.File, adminUserId: string) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de imagem foi enviado.');
    }

    const game = await this.findOne(id);

    const { relativeUrl } = await this.storageService.saveCover(file);

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: { coverUrl: relativeUrl },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPLOADED_COVER', 'Game', id, {
      coverUrl: relativeUrl,
    });

    return updatedGame;
  }

  async uploadRom(id: string, file: Express.Multer.File, adminUserId: string) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de ROM binária foi enviado.');
    }

    const game = await this.findOne(id);

    // Se já existia uma ROM anterior no disco, deletar
    if (game.romStorageKey) {
      await this.storageService.deleteRom(game.romStorageKey);
    }

    // Salvar nova ROM com cálculo de SHA-256 e tamanho em bytes
    const { storageKey, fileSizeBytes, sha256Hash } = await this.storageService.saveRom(file);

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: {
        romStorageKey: storageKey,
        romSize: fileSizeBytes,
        romHash: sha256Hash,
      },
      include: { platform: true },
    });

    await this.auditService.logAction(adminUserId, 'ADMIN_UPLOADED_ROM', 'Game', id, {
      romStorageKey: storageKey,
      romSize: fileSizeBytes,
      romHash: sha256Hash,
    });

    return updatedGame;
  }
}
