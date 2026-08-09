import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SavesService } from './saves.service';
import { CreateSaveStateDto } from './dto/create-save-state.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Save States & Cloud Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saves')
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Post()
  @ApiOperation({ summary: 'Salvar ou sincronizar slot de Save State na nuvem' })
  @ApiResponse({ status: 201, description: 'Estado salvo com sucesso.' })
  async upsertSaveState(
    @GetUser('id') userId: string,
    @Body() dto: CreateSaveStateDto,
  ) {
    return this.savesService.upsertSaveState(userId, dto);
  }

  @Get('game/:gameId')
  @ApiOperation({ summary: 'Listar slots de salvamento do usuário para um determinado jogo' })
  @ApiResponse({ status: 200, description: 'Lista de save states do jogo.' })
  async getUserSaveStates(
    @GetUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.savesService.getUserSaveStates(userId, gameId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um slot de salvamento específico' })
  @ApiResponse({ status: 200, description: 'Salvamento excluído.' })
  async deleteSaveState(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.savesService.deleteSaveState(userId, id);
  }
}
