import { Controller, Get, Post, Body, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { FoodsService } from './foods.service';
import { ExerciseService } from '../exercise/exercise.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly foodsService: FoodsService,
    private readonly exerciseService: ExerciseService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: 'Get current daily nutrition macros and targets progress' })
  @ApiResponse({ status: 200, description: 'Daily totals progress details returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTodayLogs(@Request() req: any) {
    return this.nutritionService.getTodayLogs(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get calculated nutritional summaries timeline' })
  @ApiResponse({ status: 200, description: 'Nutritional summaries returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSummary(@Request() req: any) {
    return this.nutritionService.getSummary(req.user.id);
  }

  @Get('foods/search')
  @ApiOperation({ summary: 'Search the food catalog by name' })
  @ApiResponse({ status: 200, description: 'Food catalog search results returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async searchFoods(@Query('query') query: string) {
    return this.foodsService.searchFoods(query);
  }

  @Post('log-workout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quick log calories burned from a workout' })
  @ApiResponse({ status: 200, description: 'Workout successfully logged.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logWorkout(@Request() req: any, @Body() body: { burnKcal: number }) {
    return this.exerciseService.logExercise(req.user.id, {
      activityName: 'Quick Workout',
      durationMinutes: 45,
      caloriesBurned: body.burnKcal || 300,
    });
  }
}
