import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSaveStateDto {
  @ApiProperty({ example: 'uuid-do-jogo' })
  @IsString()
  @IsNotEmpty({ message: 'O ID do jogo é obrigatório' })
  gameId: string;

  @ApiProperty({ example: 1, description: 'Número do slot de salvamento (1 a 10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  slotNumber: number;

  @ApiProperty({ example: 'data:application/octet-stream;base64,...', description: 'Dados binários do estado em Base64' })
  @IsString()
  @IsNotEmpty({ message: 'Os dados de estado da ROM são obrigatórios' })
  stateData: string;

  @ApiPropertyOptional({ example: 'data:image/png;base64,...', description: 'Thumbnail da captura de tela' })
  @IsString()
  @IsOptional()
  screenshotUrl?: string;
}
