import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogWaterDto {
  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'ml' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
