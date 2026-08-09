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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Gerenciamento de Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- ENDPOINTS DO PRÓPRIO USUÁRIO (GAMER & ADMIN) ---

  @Patch('me/profile')
  @ApiOperation({ summary: 'Atualizar próprio perfil (username e avatar)' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  async updateOwnProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Alterar própria senha' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta.' })
  async changeOwnPassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  // --- ENDPOINTS ADMINISTRATIVOS (EXCLUSIVOS PARA ADMIN) ---

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Listar usuários com paginação e filtros (Exclusivo para ADMIN)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'admin' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'isBlocked', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuários.' })
  @ApiResponse({ status: 403, description: 'Acesso negado para GAMER.' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('isBlocked') isBlocked?: string,
  ) {
    const isBlockedBool = isBlocked !== undefined ? isBlocked === 'true' : undefined;
    return this.usersService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
      role,
      isBlockedBool,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Visualizar detalhes de um usuário por ID (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário retornados.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cadastrar novo usuário com qualquer papel (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail ou Username em uso.' })
  async create(
    @Body() dto: CreateUserDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.usersService.create(dto, adminUserId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Editar dados de um usuário (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.' })
  @ApiResponse({ status: 400, description: 'Tentativa de remover privilégios do único Admin ativo.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.usersService.update(id, dto, adminUserId);
  }

  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Alternar status de bloqueio/desbloqueio de usuário (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Status de bloqueio alterado.' })
  @ApiResponse({ status: 400, description: 'Tentativa de bloquear o único Admin ativo.' })
  async toggleBlock(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
  ) {
    return this.usersService.toggleBlock(id, adminUserId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Excluir usuário com proteção do último Admin (Exclusivo para ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso.' })
  @ApiResponse({ status: 400, description: 'Proteção ativada: Não é possível excluir o único Administrador do sistema.' })
  async delete(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
  ) {
    return this.usersService.delete(id, adminUserId);
  }
}
