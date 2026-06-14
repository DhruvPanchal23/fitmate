import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogSupplementDto {
  @ApiProperty({ example: 'Creatine Monohydrate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0.1)
  dosage: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
