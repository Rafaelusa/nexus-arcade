import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'novo_nickname' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'O username deve ter no mínimo 3 caracteres' })
  username?: string;

  @ApiPropertyOptional({ example: 'https://avatar.url/me.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
