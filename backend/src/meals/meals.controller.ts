import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Meals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('meal')
  @ApiOperation({ summary: 'Log a new meal with food items' })
  @ApiResponse({ status: 201, description: 'Meal successfully logged.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createMeal(@Request() req: any, @Body() dto: CreateMealDto) {
    return this.mealsService.createMeal(req.user.id, dto);
  }

  @Get('meals')
  @ApiOperation({ summary: 'Get history of meals logged today' })
  @ApiResponse({ status: 200, description: 'Meals list returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMeals(@Request() req: any) {
    return this.mealsService.getMeals(req.user.id);
  }

  @Delete('meal/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a previously logged meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Meal not found.' })
  async deleteMeal(@Param('id') id: string) {
    return this.mealsService.deleteMeal(id);
  }
}
