import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'novo_admin@nexus.local', description: 'Endereço de e-mail do usuário' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @ApiProperty({ example: 'admin2', description: 'Username único' })
  @IsString()
  @IsNotEmpty({ message: 'O username é obrigatório' })
  @MinLength(3, { message: 'O username deve ter no mínimo 3 caracteres' })
  username: string;

  @ApiProperty({ example: 'SenhaForte123!', description: 'Senha de acesso' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.GAMER, description: 'Papel do usuário (ADMIN ou GAMER)' })
  @IsEnum(UserRole, { message: 'Papel de usuário inválido' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'https://avatar.url/icon.png', description: 'URL do avatar' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
