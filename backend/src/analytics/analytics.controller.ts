import { Controller, Get, Post, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics & Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall analytics dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard overview returned.' })
  async getDashboard(@Request() req: any) {
    return this.analyticsService.getDashboard(req.user.id);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get weight, calories, steps and body fat trend time-series' })
  @ApiResponse({ status: 200, description: 'Trends returned successfully.' })
  async getTrends(@Request() req: any) {
    return this.analyticsService.getTrends(req.user.id);
  }

  @Get('streaks')
  @ApiOperation({ summary: 'Get logging streaks for meals, exercises, and hydration' })
  @ApiResponse({ status: 200, description: 'Streaks returned successfully.' })
  async getStreaks(@Request() req: any) {
    return this.analyticsService.getStreaks(req.user.id);
  }

  @Get('adherence')
  @ApiOperation({ summary: 'Get calorie and macro targets adherence values' })
  @ApiResponse({ status: 200, description: 'Adherence values returned.' })
  async getAdherence(@Request() req: any) {
    return this.analyticsService.getAdherence(req.user.id);
  }

  @Get('health-score')
  @ApiOperation({ summary: 'Get lifestyle health score breakdown and history' })
  @ApiResponse({ status: 200, description: 'Health score breakdown returned.' })
  async getHealthScore(@Request() req: any) {
    return this.analyticsService.getHealthScore(req.user.id);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get predicted weights, completions and plateaus' })
  @ApiResponse({ status: 200, description: 'Predictions returned successfully.' })
  async getPredictions(@Request() req: any) {
    return this.analyticsService.getPredictions(req.user.id);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get unimplemented recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations returned.' })
  async getRecommendations(@Request() req: any) {
    return this.analyticsService.getRecommendations(req.user.id);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get active insights and alerts' })
  @ApiResponse({ status: 200, description: 'Insights returned.' })
  async getInsights(@Request() req: any) {
    return this.analyticsService.getInsights(req.user.id);
  }

  @Post('insight/:id/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a specific insight' })
  @ApiResponse({ status: 200, description: 'Insight dismissed successfully.' })
  async dismissInsight(@Request() req: any, @Param('id') id: string) {
    return this.analyticsService.dismissInsight(req.user.id, id);
  }
}
export default AnalyticsController;
