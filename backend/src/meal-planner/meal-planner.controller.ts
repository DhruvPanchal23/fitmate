import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealPlannerService } from './meal-planner.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  GenerateMealPlanRequest,
  ReplaceMealRequest,
  ReplaceIngredientRequest,
  RegenerateMealRequest,
  SaveTemplateRequest,
  UpdateTitleRequest,
} from '../../../shared/contracts';

@ApiTags('Meal Planner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-planner')
export class MealPlannerController {
  constructor(private readonly plannerService: MealPlannerService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate personalized daily or weekly meal plan' })
  @ApiResponse({ status: 201, description: 'Plan successfully generated.' })
  async generate(@Request() req: any, @Body() dto: GenerateMealPlanRequest) {
    return this.plannerService.generatePlan(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user meal plans' })
  async getPlans(@Request() req: any) {
    return this.plannerService.getPlans(req.user.id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get adherence and progress analytics for active meal plan' })
  async getAnalytics(@Request() req: any) {
    return this.plannerService.getAdherenceAnalytics(req.user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get saved meal plan templates' })
  async getTemplates(@Request() req: any) {
    return this.plannerService.getTemplates(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific meal plan' })
  async getPlan(@Param('id') id: string) {
    return this.plannerService.getPlan(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal plan title' })
  async updatePlan(@Param('id') id: string, @Body() body: UpdateTitleRequest) {
    return this.plannerService.updatePlanTitle(id, body.title);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal plan' })
  async deletePlan(@Param('id') id: string) {
    return this.plannerService.deletePlan(id);
  }

  @Post('regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate part of a meal plan (meal slot or day)' })
  async regenerate(@Request() req: any, @Body() dto: RegenerateMealRequest) {
    return this.plannerService.regeneratePart(req.user.id, dto);
  }

  @Post('replace')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Replace planned food item in a slot' })
  async replaceMeal(@Request() req: any, @Body() dto: ReplaceMealRequest) {
    return this.plannerService.replaceMeal(req.user.id, dto);
  }

  @Post('replace-ingredient')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Replace an ingredient/food item while keeping macros similar' })
  async replaceIngredient(@Request() req: any, @Body() dto: ReplaceIngredientRequest) {
    return this.plannerService.replaceIngredient(req.user.id, dto);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set meal plan status to active' })
  async activate(@Request() req: any, @Body() body: { planId: string }) {
    return this.plannerService.activatePlan(req.user.id, body.planId);
  }

  @Post('template/save')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save meal plan as template' })
  async saveTemplate(@Request() req: any, @Body() dto: SaveTemplateRequest) {
    return this.plannerService.savePlanAsTemplate(req.user.id, dto);
  }

  @Delete('template/:id')
  @ApiOperation({ summary: 'Delete a saved template' })
  async deleteTemplate(@Param('id') id: string) {
    return this.plannerService.deleteTemplate(id);
  }

  @Get('shopping-list/:id')
  @ApiOperation({ summary: 'Get aggregated shopping grocery list for meal plan' })
  async getShoppingList(@Param('id') id: string) {
    return this.plannerService.getShoppingList(id);
  }

  @Post('meal/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log planned meal as completed' })
  async completeMeal(@Request() req: any, @Param('id') id: string) {
    return this.plannerService.completeMeal(req.user.id, id);
  }

  @Post('meal/:id/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log planned meal as skipped' })
  async skipMeal(@Request() req: any, @Param('id') id: string) {
    return this.plannerService.skipMeal(req.user.id, id);
  }
}
export default MealPlannerController;
