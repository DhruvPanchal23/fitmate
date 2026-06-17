import { Controller, Get, Patch, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProfileRequest, CreateBodyMeasurementRequest } from '../../../shared/contracts/profile';

@ApiTags('Profile & Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile details along with active goals' })
  async getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile (triggers asynchronous recalculation)' })
  async updateProfile(@Request() req: any, @Body() body: UpdateProfileRequest) {
    return this.profileService.updateProfile(req.user.id, body);
  }

  @Post('draft')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save onboarding wizard progress as a draft' })
  async saveDraft(@Request() req: any, @Body() body: any) {
    return this.profileService.saveOnboardingDraft(req.user.id, body);
  }

  @Get('completion')
  @ApiOperation({ summary: 'Get profile completion and AI readiness scores' })
  async getCompletion(@Request() req: any) {
    return this.profileService.getCompletionScore(req.user.id);
  }

  @Get('health-score')
  @ApiOperation({ summary: 'Calculate current dynamic health score' })
  async getHealthScore(@Request() req: any) {
    return this.profileService.getHealthScore(req.user.id);
  }

  @Get('recommendation')
  @ApiOperation({ summary: 'Retrieve recommendation if weight changed significantly' })
  async getRecommendations(@Request() req: any) {
    return this.profileService.getGoalRecommendations(req.user.id);
  }

  @Post('body-measurement')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a new body measurement' })
  async logMeasurement(@Request() req: any, @Body() body: CreateBodyMeasurementRequest) {
    return this.profileService.logBodyMeasurement(req.user.id, body);
  }

  @Get('body-measurements')
  @ApiOperation({ summary: 'Get all user body measurements logs' })
  async getMeasurements(@Request() req: any) {
    return this.profileService.getBodyMeasurements(req.user.id);
  }

  @Get('progress/weight')
  @ApiOperation({ summary: 'Get weight tracking trend data' })
  async getWeightProgress(@Request() req: any) {
    return this.profileService.getWeightProgress(req.user.id);
  }

  @Get('progress/body-fat')
  @ApiOperation({ summary: 'Get body fat progress trends' })
  async getBodyFatProgress(@Request() req: any) {
    return this.profileService.getBodyFatProgress(req.user.id);
  }

  @Get('progress/measurements')
  @ApiOperation({ summary: 'Get all body measurements trends' })
  async getMeasurementsProgress(@Request() req: any) {
    return this.profileService.getMeasurementsProgress(req.user.id);
  }
}
export default ProfileController;
