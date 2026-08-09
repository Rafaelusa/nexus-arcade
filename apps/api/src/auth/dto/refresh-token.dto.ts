import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token JWT fornecido no login' })
  @IsString()
  @IsNotEmpty({ message: 'O refreshToken é obrigatório' })
  refreshToken: string;
}
