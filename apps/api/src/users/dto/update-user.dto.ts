import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'novo_email@nexus.local' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'novo_username' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'O username deve ter no mínimo 3 caracteres' })
  username?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole, { message: 'Papel de usuário inválido' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'https://avatar.url/new.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
