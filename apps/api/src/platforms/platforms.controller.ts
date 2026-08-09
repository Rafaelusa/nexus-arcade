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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Plataformas de Jogos')
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as plataformas ativas do sistema' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de plataformas retornada.' })
  async findAll(@Query('onlyActive') onlyActive?: string) {
    const isOnlyActive = onlyActive === undefined ? true : onlyActive === 'true';
    return this.platformsService.findAll(isOnlyActive);
  }

  @Get(':idOrCode')
  @ApiOperation({ summary: 'Obter detalhes de uma plataforma pelo ID ou Código (ex: snes)' })
  @ApiResponse({ status: 200, description: 'Plataforma retornada.' })
  @ApiResponse({ status: 404, description: 'Plataforma não encontrada.' })
  async findOne(@Param('idOrCode') idOrCode: string) {
    return this.platformsService.findOne(idOrCode);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Cadastrar nova plataforma (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 201, description: 'Plataforma cadastrada com sucesso.' })
  @ApiResponse({ status: 409, description: 'Código de plataforma já existente.' })
  async create(
    @Body() dto: CreatePlatformDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.platformsService.create(dto, adminUserId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Editar plataforma existente (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Plataforma atualizada.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.platformsService.update(id, dto, adminUserId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Excluir plataforma (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Plataforma excluída com sucesso.' })
  @ApiResponse({ status: 400, description: 'Não é possível excluir plataforma com jogos vinculados.' })
  async delete(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
  ) {
    return this.platformsService.delete(id, adminUserId);
  }
}
