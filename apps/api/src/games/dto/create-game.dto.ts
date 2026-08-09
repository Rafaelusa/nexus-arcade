import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ example: 'Super Mario World', description: 'Título do jogo' })
  @IsString()
  @IsNotEmpty({ message: 'O título do jogo é obrigatório' })
  title: string;

  @ApiProperty({ example: 'Clássico jogo de plataforma 16-bit da Nintendo.', description: 'Descrição detalhada' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição do jogo é obrigatória' })
  description: string;

  @ApiProperty({ example: 'uuid-da-plataforma', description: 'ID da plataforma à qual o jogo pertence (ex: SNES)' })
  @IsString()
  @IsNotEmpty({ message: 'O ID da plataforma é obrigatório' })
  platformId: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf' })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ example: 1990 })
  @IsInt()
  @Min(1970)
  @Max(2030)
  @IsOptional()
  releaseYear?: number;

  @ApiPropertyOptional({ example: 'Nintendo EAD' })
  @IsString()
  @IsOptional()
  developer?: string;

  @ApiPropertyOptional({ example: 'Nintendo' })
  @IsString()
  @IsOptional()
  publisher?: string;
}
