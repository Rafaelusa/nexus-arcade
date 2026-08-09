import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'gamer@nexus.local', description: 'Endereço de e-mail do usuário' })
  @IsEmail({}, { message: 'Endereço de e-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @ApiProperty({ example: 'gamer123', description: 'Nome de usuário único' })
  @IsString()
  @IsNotEmpty({ message: 'O username é obrigatório' })
  @MinLength(3, { message: 'O username deve ter no mínimo 3 caracteres' })
  username: string;

  @ApiProperty({ example: 'Password123!', description: 'Senha de acesso' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
