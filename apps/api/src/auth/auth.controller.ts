import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Autenticação & Segurança')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário (GAMER)' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso e tokens emitidos.' })
  @ApiResponse({ status: 409, description: 'E-mail ou Username já cadastrado.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário e obter tokens JWT' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas ou conta bloqueada.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar Access Token através do Refresh Token' })
  @ApiResponse({ status: 200, description: 'Novo Access Token gerado.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado atual' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token de acesso inválido ou expirado.' })
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Get('admin-test')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint de teste de autorização RBAC exclusivo para ADMIN' })
  @ApiResponse({ status: 200, description: 'Acesso concedido para ADMIN.' })
  @ApiResponse({ status: 403, description: 'Acesso negado: Perfil sem privilégios de ADMIN.' })
  async testAdminRole(@GetUser() user: any) {
    return {
      message: 'Acesso concedido com sucesso! Você possui permissão de ADMINISTRADOR.',
      user,
    };
  }
}
