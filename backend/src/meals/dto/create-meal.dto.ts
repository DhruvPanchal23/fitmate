import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMealItemDto {
  @ApiProperty({ example: 'Oatmeal' })
  @IsString()
  @IsNotEmpty()
  foodName: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'bowl' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  calories: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  protein: number;

  @ApiProperty({ example: 27 })
  @IsNumber()
  carbohydrates: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  fats: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  fiber: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sugar: number;
}

export class CreateMealDto {
  @ApiProperty({ example: 'Breakfast' })
  @IsEnum(['Breakfast', 'Lunch', 'Dinner', 'Snack'])
  mealType: string;

  @ApiProperty({ example: 'manual' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ type: [CreateMealItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items: CreateMealItemDto[];
}
