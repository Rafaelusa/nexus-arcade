import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSaveStateDto } from './dto/create-save-state.dto';

@Injectable()
export class SavesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSaveState(userId: string, dto: CreateSaveStateDto) {
    const existing = await this.prisma.saveState.findFirst({
      where: {
        userId,
        gameId: dto.gameId,
        slotIndex: dto.slotNumber,
      },
    });

    if (existing) {
      return this.prisma.saveState.update({
        where: { id: existing.id },
        data: {
          storageKey: dto.stateData,
          screenshotUrl: dto.screenshotUrl,
          name: `Slot ${dto.slotNumber}`,
        },
      });
    }

    return this.prisma.saveState.create({
      data: {
        userId,
        gameId: dto.gameId,
        slotIndex: dto.slotNumber,
        name: `Slot ${dto.slotNumber}`,
        storageKey: dto.stateData,
        screenshotUrl: dto.screenshotUrl,
      },
    });
  }

  async getUserSaveStates(userId: string, gameId: string) {
    return this.prisma.saveState.findMany({
      where: {
        userId,
        gameId,
      },
      orderBy: { slotIndex: 'asc' },
    });
  }

  async deleteSaveState(userId: string, saveId: string) {
    const saveState = await this.prisma.saveState.findUnique({
      where: { id: saveId },
    });

    if (!saveState) {
      throw new NotFoundException(`Slot de salvamento "${saveId}" não foi encontrado.`);
    }

    if (saveState.userId !== userId) {
      throw new UnauthorizedException('Você não tem permissão para excluir este salvamento.');
    }

    await this.prisma.saveState.delete({
      where: { id: saveId },
    });

    return { message: 'Slot de salvamento excluído com sucesso.' };
  }
}
