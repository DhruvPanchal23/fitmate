import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupplementsService } from './supplements.service';
import { LogSupplementDto } from './dto/log-supplement.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Supplements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class SupplementsController {
  constructor(private readonly supplementsService: SupplementsService) {}

  @Post('supplement')
  @ApiOperation({ summary: 'Log daily supplement dosage' })
  @ApiResponse({ status: 201, description: 'Supplement intake successfully logged.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logSupplement(@Request() req: any, @Body() dto: LogSupplementDto) {
    return this.supplementsService.logSupplement(req.user.id, dto);
  }

  @Get('supplement')
  @ApiOperation({ summary: 'Get supplement logs for today' })
  @ApiResponse({ status: 200, description: 'Supplement logs list returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSupplementLogs(@Request() req: any) {
    return this.supplementsService.getSupplementLogs(req.user.id);
  }
}
