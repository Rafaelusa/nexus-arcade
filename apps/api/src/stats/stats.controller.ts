import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

class StartSessionDto {
  @ApiProperty({ example: 'uuid-do-jogo' })
  @IsString()
  @IsNotEmpty()
  gameId: string;
}

class EndSessionDto {
  @ApiProperty({ example: 'uuid-da-sessao' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 300, required: false })
  @IsInt()
  @IsOptional()
  durationSeconds?: number;
}

@ApiTags('Estatísticas do Gamer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter estatísticas de uso, tempo de jogo e histórico recente do usuário' })
  @ApiResponse({ status: 200, description: 'Estatísticas completas do usuário.' })
  async getMyStats(@GetUser('id') userId: string) {
    return this.statsService.getUserStats(userId);
  }

  @Post('sessions/start')
  @ApiOperation({ summary: 'Registrar início de uma sessão de jogo' })
  @ApiResponse({ status: 201, description: 'Sessão iniciada.' })
  async startSession(
    @GetUser('id') userId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.statsService.startSession(userId, dto.gameId);
  }

  @Patch('sessions/end')
  @ApiOperation({ summary: 'Finalizar uma sessão de jogo e computar tempo de jogo' })
  @ApiResponse({ status: 200, description: 'Sessão finalizada com sucesso.' })
  async endSession(@Body() dto: EndSessionDto) {
    return this.statsService.endSession(dto.sessionId, dto.durationSeconds);
  }
}
