import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Auditoria & Logs (Admin)')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria do sistema com paginação (Exclusivo para ADMIN)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'action', required: false, example: 'ADMIN_CREATED_USER' })
  @ApiResponse({ status: 200, description: 'Lista paginada de logs de auditoria.' })
  @ApiResponse({ status: 403, description: 'Acesso negado para não administradores.' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('action') action?: string,
  ) {
    return this.auditService.findAll(parseInt(page, 10), parseInt(limit, 10), action);
  }
}
