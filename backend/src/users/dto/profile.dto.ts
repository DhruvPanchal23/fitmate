import { IsInt, IsNumber, IsString, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(1)
  @Max(120)
  age: number;

  @ApiProperty({ example: 'male' })
  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @ApiProperty({ example: 175.5 })
  @IsNumber()
  @Min(50)
  @Max(250)
  height: number; // in cm

  @ApiProperty({ example: 70.2 })
  @IsNumber()
  @Min(20)
  @Max(300)
  weight: number; // in kg

  @ApiProperty({ example: 'moderately_active' })
  @IsEnum(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
  activityLevel: string;

  @ApiProperty({ example: 'maintenance' })
  @IsEnum(['fat_loss', 'muscle_gain', 'maintenance'])
  goal: string;
}
