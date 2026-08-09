import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateGameDto {
  @ApiPropertyOptional({ example: 'Super Mario World (Special Edition)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Nova descrição do jogo.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-da-plataforma' })
  @IsString()
  @IsOptional()
  platformId?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf' })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ example: 1991 })
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
