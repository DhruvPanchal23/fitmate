import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SecurityScoreService } from './services/security-score.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly securityScoreService: SecurityScoreService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile details returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Update or create current user profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('security-score')
  @ApiOperation({ summary: 'Evaluate and return user security rating score (0-100)' })
  @ApiResponse({ status: 200, description: 'Security evaluation successful.' })
  async getSecurityScore(@Request() req: any) {
    return this.securityScoreService.calculateScore(req.user.id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export user personal profile and logs in JSON structure' })
  @ApiResponse({ status: 200, description: 'Structured JSON user data export.' })
  async exportData(@Request() req: any) {
    return this.usersService.exportUserData(req.user.id);
  }

  @Delete('gdpr/memory')
  @ApiOperation({ summary: 'Delete user long-term AI memory and preferences' })
  @ApiResponse({ status: 200, description: 'User AI memory deleted.' })
  async deleteMemory(@Request() req: any) {
    return this.usersService.deleteMemory(req.user.id);
  }

  @Delete('gdpr/analytics')
  @ApiOperation({ summary: 'Delete user historical analytics snapshots' })
  @ApiResponse({ status: 200, description: 'User analytics snapshots deleted.' })
  async deleteAnalytics(@Request() req: any) {
    return this.usersService.deleteAnalytics(req.user.id);
  }

  @Delete('gdpr/conversations')
  @ApiOperation({ summary: 'Delete all user chat history and logs' })
  @ApiResponse({ status: 200, description: 'User chat history deleted.' })
  async deleteConversations(@Request() req: any) {
    return this.usersService.deleteConversations(req.user.id);
  }

  @Delete('gdpr/travel')
  @ApiOperation({ summary: 'Delete user travel engine sessions and logs' })
  @ApiResponse({ status: 200, description: 'User travel data deleted.' })
  async deleteTravel(@Request() req: any) {
    return this.usersService.deleteTravelData(req.user.id);
  }

  @Delete('gdpr/account')
  @ApiOperation({ summary: 'Soft delete user account (flags suspension and revokes sessions)' })
  @ApiResponse({ status: 200, description: 'User account soft-deleted.' })
  async softDelete(@Request() req: any) {
    return this.usersService.softDeleteAccount(req.user.id);
  }

  @Delete('gdpr/account/permanent')
  @ApiOperation({ summary: 'Permanently purge user account and all child records' })
  @ApiResponse({ status: 200, description: 'User account permanently purged.' })
  async permanentDelete(@Request() req: any) {
    return this.usersService.permanentlyDeleteAccount(req.user.id);
  }
}
