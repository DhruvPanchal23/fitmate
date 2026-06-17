import { Controller, Post, Get, Body, UseGuards, Request, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ToggleTravelModeRequest,
  StartTravelRequest,
} from '../../../shared/contracts';

@ApiTags('Travel Mode')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle Travel Mode state' })
  @ApiResponse({ status: 200, description: 'Travel Mode toggled successfully.' })
  async toggleTravel(@Request() req: any, @Body() body: ToggleTravelModeRequest) {
    return this.travelService.toggleTravelMode(req.user.id, body.active);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get Travel stats for the active user' })
  @ApiResponse({ status: 200, description: 'Travel stats returned successfully.' })
  async getStats(@Request() req: any) {
    return this.travelService.getTravelStats(req.user.id);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start Travel Mode session' })
  @ApiResponse({ status: 200, description: 'Travel Mode session started successfully.' })
  async startTravel(@Request() req: any, @Body() body: StartTravelRequest) {
    return this.travelService.startTravel(req.user.id, body);
  }

  @Post('end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End Travel Mode session' })
  @ApiResponse({ status: 200, description: 'Travel Mode session ended and compensation plan generated successfully.' })
  async endTravel(@Request() req: any) {
    return this.travelService.endTravel(req.user.id);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active travel session' })
  @ApiResponse({ status: 200, description: 'Active travel session details returned.' })
  async getCurrentSession(@Request() req: any) {
    return this.travelService.getActiveSession(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get travel session history list' })
  @ApiResponse({ status: 200, description: 'Travel sessions list returned.' })
  async getHistory(@Request() req: any) {
    return this.travelService.getHistory(req.user.id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics for a travel session' })
  @ApiResponse({ status: 200, description: 'Travel session analytics returned.' })
  async getAnalytics(@Request() req: any, @Query('sessionId') sessionId?: string) {
    return this.travelService.getAnalytics(req.user.id, sessionId);
  }

  @Get('recovery')
  @ApiOperation({ summary: 'Get active compensation/recovery plan' })
  @ApiResponse({ status: 200, description: 'Recovery plan schedule returned.' })
  async getRecovery(@Request() req: any) {
    return this.travelService.getRecoveryPlan(req.user.id);
  }

  @Post('recovery/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update recovery plan status' })
  @ApiResponse({ status: 200, description: 'Recovery plan status updated.' })
  async updateRecoveryStatus(
    @Request() req: any,
    @Body() body: { planId: string; status: string },
  ) {
    return this.travelService.updateRecoveryStatus(req.user.id, body.planId, body.status);
  }
}
export default TravelController;

