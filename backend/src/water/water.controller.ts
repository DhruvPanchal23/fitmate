import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WaterService } from './water.service';
import { LogWaterDto } from './dto/log-water.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Water')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Post('water')
  @ApiOperation({ summary: 'Log daily water intake amount' })
  @ApiResponse({ status: 201, description: 'Water intake successfully logged.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logWater(@Request() req: any, @Body() dto: LogWaterDto) {
    return this.waterService.logWater(req.user.id, dto);
  }

  @Get('water')
  @ApiOperation({ summary: 'Get water logs for today' })
  @ApiResponse({ status: 200, description: 'Water logs list returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getWaterLogs(@Request() req: any) {
    return this.waterService.getWaterLogs(req.user.id);
  }
}
