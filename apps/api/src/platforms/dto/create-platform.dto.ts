import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlatformDto {
  @ApiProperty({ example: 'Game Boy Advance', description: 'Nome da plataforma' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da plataforma é obrigatório' })
  name: string;

  @ApiProperty({ example: 'gba', description: 'Código único legível em URL (ex: snes, nes, gba, megadrive)' })
  @IsString()
  @IsNotEmpty({ message: 'O código identificador é obrigatório' })
  code: string;

  @ApiPropertyOptional({ example: 'Console portátil de 32-bit lançado pela Nintendo em 2001.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '/assets/icons/gba.svg' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
