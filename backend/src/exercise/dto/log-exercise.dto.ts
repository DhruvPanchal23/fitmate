import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogExerciseDto {
  @ApiProperty({ example: 'Running' })
  @IsString()
  @IsNotEmpty()
  activityName: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(1)
  caloriesBurned: number;
}
