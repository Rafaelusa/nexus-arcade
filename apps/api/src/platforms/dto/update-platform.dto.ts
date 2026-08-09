import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlatformDto {
  @ApiPropertyOptional({ example: 'Game Boy Advance SP' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'gba' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Nova descrição da plataforma' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '/assets/icons/gba_sp.svg' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
