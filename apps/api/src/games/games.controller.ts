import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { StorageService } from '../storage/storage.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Catálogo de Jogos & ROMs')
@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buscar e listar jogos do catálogo com busca e filtros' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'Mario' })
  @ApiQuery({ name: 'platformId', required: false })
  @ApiQuery({ name: 'platformCode', required: false, example: 'snes' })
  @ApiResponse({ status: 200, description: 'Lista de jogos paginada.' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('platformId') platformId?: string,
    @Query('platformCode') platformCode?: string,
  ) {
    return this.gamesService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
      platformId,
      platformCode,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um jogo por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do jogo.' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Get(':id/rom/stream')
  @ApiOperation({ summary: 'Streaming / Download do arquivo binário da ROM para o Emulador' })
  @ApiResponse({ status: 200, description: 'Stream do arquivo binário da ROM.' })
  @ApiResponse({ status: 404, description: 'ROM binária não foi encontrada.' })
  async streamRom(@Param('id') id: string, @Res() res: Response) {
    const game = await this.gamesService.findOne(id);

    if (!game.romStorageKey) {
      throw new NotFoundException(`Nenhuma ROM foi cadastrada para o jogo "${game.title}".`);
    }

    const romPath = this.storageService.getRomPath(game.romStorageKey);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${game.title.replace(/\s+/g, '_')}.rom"`);
    if (game.romSize) {
      res.setHeader('Content-Length', game.romSize.toString());
    }

    const fileStream = fs.createReadStream(romPath);
    fileStream.pipe(res);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Cadastrar novo jogo (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 201, description: 'Jogo criado com sucesso.' })
  async create(
    @Body() dto: CreateGameDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.gamesService.create(dto, adminUserId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Editar metadados do jogo (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogo atualizado.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGameDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.gamesService.update(id, dto, adminUserId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Excluir jogo e seus arquivos de mídia (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogo e ROM binária excluídos.' })
  async delete(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
  ) {
    return this.gamesService.delete(id, adminUserId);
  }

  @Post(':id/cover')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload da imagem de capa do jogo (Exclusivo para ADMIN)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') adminUserId: string,
  ) {
    return this.gamesService.uploadCover(id, file, adminUserId);
  }

  @Post(':id/rom')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload do arquivo binário da ROM com cálculo de hash SHA-256 (Exclusivo para ADMIN)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadRom(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') adminUserId: string,
  ) {
    return this.gamesService.uploadRom(id, file, adminUserId);
  }
}
