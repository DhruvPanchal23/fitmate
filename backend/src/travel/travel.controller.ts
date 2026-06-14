import { Controller, Post, Get, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ToggleTravelModeRequest } from '../../../shared/contracts';

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
}
export default TravelController;
