import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UserManagementService } from './services/user-management.service';
import { FoodManagementService } from './services/food-management.service';
import { PromptManagementService } from './services/prompt-management.service';
import { NotificationManagementService } from './services/notification-management.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { RemoteConfigService } from './services/remote-config.service';
import { AuditService } from './services/audit.service';
import { AnalyticsManagementService } from './services/analytics-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminRbacGuard } from './guards/admin-rbac.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { MetricsEngineService } from '../health/metrics-engine.service';
import { SchedulerService } from '../common/scheduler/scheduler.service';
import { BackupService } from '../common/backup/backup.service';
import { ErrorService } from '../common/errors/error.service';
import { SessionService } from '../auth/session/session.service';
import * as os from 'os';

@ApiTags('Admin Portal')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userManagementService: UserManagementService,
    private readonly foodManagementService: FoodManagementService,
    private readonly promptManagementService: PromptManagementService,
    private readonly notificationManagementService: NotificationManagementService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly remoteConfigService: RemoteConfigService,
    private readonly auditService: AuditService,
    private readonly analyticsService: AnalyticsManagementService,
    private readonly metricsService: MetricsEngineService,
    private readonly schedulerService: SchedulerService,
    private readonly backupService: BackupService,
    private readonly errorService: ErrorService,
    private readonly sessionService: SessionService,
  ) {}

  // --- Setup & Auth (Public) ---
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed RBAC permissions and create default Super Admin' })
  async setupAdmin(@Body() body: { email: string; passwordHash: string; fullName: string }) {
    await this.adminService.seedRBAC();
    return this.adminService.registerAdmin({
      email: body.email,
      passwordHash: body.passwordHash,
      fullName: body.fullName,
      roleName: 'Super Admin',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login verification' })
  async loginAdmin(@Body() body: { email: string; password?: string }) {
    return this.adminService.loginAdmin(body);
  }

  // --- Profile (Protected) ---
  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @ApiOperation({ summary: 'Get current admin user profile details' })
  async getProfile(@Request() req: any) {
    return this.adminService.getAdminProfile(req.user.sub);
  }

  // --- Dashboard Metrics (Protected) ---
  @Get('dashboard')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('analytics:read')
  @ApiOperation({ summary: 'Get administrative dashboard metrics' })
  async getDashboard(@Request() req: any) {
    return this.analyticsService.getMetrics(req.user.sub);
  }

  // --- User Management (Protected) ---
  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Search user list' })
  async searchUsers(@Request() req: any, @Query('q') query: string) {
    return this.userManagementService.searchUsers(query || '', req.user.sub);
  }

  @Post('users/:id/suspend')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  async suspendUser(@Request() req: any, @Param('id') id: string) {
    return this.userManagementService.suspendUser(id, req.user.sub);
  }

  @Post('users/:id/ban')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:ban')
  @ApiOperation({ summary: 'Ban user account' })
  async banUser(@Request() req: any, @Param('id') id: string) {
    return this.userManagementService.banUser(id, req.user.sub);
  }

  @Post('users/:id/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:suspend')
  @ApiOperation({ summary: 'Restore account status' })
  async restoreUser(@Request() req: any, @Param('id') id: string) {
    return this.userManagementService.restoreUser(id, req.user.sub);
  }

  @Post('users/:id/reset-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:write')
  @ApiOperation({ summary: 'Reset profile wizard fields to defaults' })
  async resetProfile(@Request() req: any, @Param('id') id: string) {
    return this.userManagementService.resetUserProfile(id, req.user.sub);
  }

  @Post('users/:id/impersonate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:write')
  @ApiOperation({ summary: 'Impersonate a user to test profiles (dev only)' })
  async impersonateUser(@Request() req: any, @Param('id') id: string) {
    return this.userManagementService.impersonateUser(id, req.user.sub);
  }

  // --- Food Catalog CMS (Protected) ---
  @Get('foods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:read')
  @ApiOperation({ summary: 'Query food catalog list' })
  async searchFoods(@Request() req: any, @Query('q') query: string) {
    return this.foodManagementService.searchFoods(query || '', req.user.sub);
  }

  @Post('foods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:write')
  @ApiOperation({ summary: 'Create a new food entry' })
  async createFood(@Request() req: any, @Body() body: any) {
    return this.foodManagementService.createFood(body, req.user.sub);
  }

  @Put('foods/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:write')
  @ApiOperation({ summary: 'Update food values' })
  async updateFood(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.foodManagementService.updateFood(id, body, req.user.sub);
  }

  @Delete('foods/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:write')
  @ApiOperation({ summary: 'Delete a food catalog entry' })
  async deleteFood(@Request() req: any, @Param('id') id: string) {
    return this.foodManagementService.deleteFood(id, req.user.sub);
  }

  @Post('foods/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:approve')
  @ApiOperation({ summary: 'Approve custom user foods' })
  async approveFood(@Request() req: any, @Param('id') id: string) {
    return this.foodManagementService.approveFood(id, req.user.sub);
  }

  @Post('foods/:id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:approve')
  @ApiOperation({ summary: 'Reject custom user foods' })
  async rejectFood(@Request() req: any, @Param('id') id: string) {
    return this.foodManagementService.rejectFood(id, req.user.sub);
  }

  @Post('foods/merge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:write')
  @ApiOperation({ summary: 'Merge duplicate catalog items' })
  async mergeFoods(@Request() req: any, @Body() body: { sourceId: string; targetId: string }) {
    return this.foodManagementService.mergeFoods(body.sourceId, body.targetId, req.user.sub);
  }

  @Post('foods/import')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:write')
  @ApiOperation({ summary: 'Bulk import foods catalog array' })
  async bulkImport(@Request() req: any, @Body() body: { foods: any[] }) {
    return this.foodManagementService.bulkImport(body.foods, req.user.sub);
  }

  @Get('foods/export')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('foods:read')
  @ApiOperation({ summary: 'Bulk export catalog data' })
  async bulkExport(@Request() req: any) {
    return this.foodManagementService.bulkExport(req.user.sub);
  }

  // --- Prompt Management (Protected) ---
  @Get('prompts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('prompts:read')
  @ApiOperation({ summary: 'Get all prompt templates' })
  async getPrompts(@Request() req: any) {
    return this.promptManagementService.getPrompts(req.user.sub);
  }

  @Post('prompts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('prompts:write')
  @ApiOperation({ summary: 'Create prompt template key' })
  async createPromptTemplate(@Request() req: any, @Body() body: { key: string; description: string }) {
    return this.promptManagementService.createPromptTemplate(body.key, body.description, req.user.sub);
  }

  @Post('prompts/:key/versions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('prompts:write')
  @ApiOperation({ summary: 'Add a new version for a prompt template' })
  async addPromptVersion(@Request() req: any, @Param('key') key: string, @Body() body: { content: string }) {
    return this.promptManagementService.addPromptVersion(key, body.content, req.user.sub, req.user.email);
  }

  @Post('prompts/:key/activate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('prompts:activate')
  @ApiOperation({ summary: 'Activate a specific prompt template version' })
  async activatePromptVersion(@Request() req: any, @Param('key') key: string, @Body() body: { versionId: string }) {
    return this.promptManagementService.activatePromptVersion(key, body.versionId, req.user.sub);
  }

  @Get('prompts/:key/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('prompts:read')
  @ApiOperation({ summary: 'Preview prompt variable mappings' })
  async previewPrompt(@Param('key') key: string, @Query('versionId') versionId: string) {
    return this.promptManagementService.previewPrompt(key, versionId);
  }

  // --- Feature Flags (Protected) ---
  @Get('flags')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('flags:read')
  @ApiOperation({ summary: 'Get list of feature flags' })
  async getFeatureFlags(@Request() req: any) {
    return this.featureFlagService.getFeatureFlags(req.user.sub);
  }

  @Post('flags')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('flags:write')
  @ApiOperation({ summary: 'Create or update feature flag' })
  async createFeatureFlag(@Request() req: any, @Body() body: any) {
    return this.featureFlagService.createFeatureFlag(body, req.user.sub);
  }

  @Put('flags/:key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('flags:write')
  @ApiOperation({ summary: 'Update feature flag toggle status' })
  async updateFeatureFlag(@Request() req: any, @Param('key') key: string, @Body() body: any) {
    return this.featureFlagService.updateFeatureFlag(key, body, req.user.sub);
  }

  // --- Remote Configs (Protected) ---
  @Get('configs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:read')
  @ApiOperation({ summary: 'Get list of remote configurations' })
  async getRemoteConfigs(@Request() req: any) {
    return this.remoteConfigService.getRemoteConfigs(req.user.sub);
  }

  @Post('configs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:write')
  @ApiOperation({ summary: 'Create remote configuration parameter' })
  async createRemoteConfig(@Request() req: any, @Body() body: any) {
    return this.remoteConfigService.createRemoteConfig(body, req.user.sub);
  }

  @Put('configs/:key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:write')
  @ApiOperation({ summary: 'Update remote configuration parameter value' })
  async updateRemoteConfig(@Request() req: any, @Param('key') key: string, @Body() body: any) {
    return this.remoteConfigService.updateRemoteConfig(key, body, req.user.sub);
  }

  // --- System Announcements (Protected) ---
  @Get('announcements')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('announcements:read')
  @ApiOperation({ summary: 'Get system announcements list' })
  async getAnnouncements(@Request() req: any) {
    return this.notificationManagementService.getAnnouncements(req.user.sub);
  }

  @Post('announcements')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('announcements:write')
  @ApiOperation({ summary: 'Schedule system announcement' })
  async createAnnouncement(@Request() req: any, @Body() body: any) {
    return this.notificationManagementService.createAnnouncement(body, req.user.sub);
  }

  // --- Audit Logs (Protected) ---
  @Get('audits')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('audits:read')
  @ApiOperation({ summary: 'Get administrative audit log list' })
  async getAuditLogs() {
    return this.auditService.getLogs();
  }

  // --- Production Hardening & Operations Endpoints (Protected) ---

  @Get('system/health')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('analytics:read')
  @ApiOperation({ summary: 'Get detailed system components health dashboard' })
  async getSystemHealth() {
    const mem = process.memoryUsage();
    const metricsSummary = this.metricsService.getMetricsSummary();
    const geminiKey = process.env.GEMINI_API_KEY ? 'configured' : 'missing';
    const openAiKey = process.env.OPENAI_API_KEY ? 'configured' : 'missing';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      },
      cpu: {
        loadavg: os.loadavg(),
        cores: os.cpus().length,
      },
      providers: {
        gemini: geminiKey,
        openai: openAiKey,
      },
      metrics: metricsSummary,
    };
  }

  @Get('jobs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:read')
  @ApiOperation({ summary: 'Get background scheduler jobs status list' })
  async getJobs() {
    return this.schedulerService.getJobsStatus();
  }

  @Post('jobs/:name/run')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:write')
  @ApiOperation({ summary: 'Trigger a background job manually' })
  async runJob(@Param('name') name: string) {
    await this.schedulerService.runJob(name);
    return { success: true, message: `Job ${name} triggered successfully` };
  }

  @Get('cache/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:read')
  @ApiOperation({ summary: 'Get cache statistics' })
  async getCacheStats() {
    const summary = this.metricsService.getMetricsSummary();
    return {
      hitRatio: summary.cacheHitRatio,
      totalRequests: summary.totalRequests,
    };
  }

  @Get('sessions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Get active user sessions' })
  async getUserSessions(@Query('userId') userId?: string) {
    if (userId) {
      return this.sessionService.getActiveSessions(userId);
    }
    return [];
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('users:write')
  @ApiOperation({ summary: 'Revoke a user session' })
  async revokeSession(@Param('id') id: string, @Query('userId') userId: string) {
    await this.sessionService.revokeSession(id, userId);
    return { success: true };
  }

  @Get('errors')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('audits:read')
  @ApiOperation({ summary: 'Get recent errors and critical failures log' })
  async getRecentErrors() {
    return {
      inMemory: this.errorService.getRecentErrors(),
      critical: this.errorService.getCriticalErrorsFromFile(),
    };
  }

  @Get('backups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:read')
  @ApiOperation({ summary: 'Get list of backup snapshots' })
  async getBackups() {
    return this.backupService.listBackups();
  }

  @Post('backups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:write')
  @ApiOperation({ summary: 'Trigger a backup snapshot creation' })
  async createBackup(@Body() body: { type: 'database' | 'prompts' | 'memory' | 'food' | 'config' | 'all' }) {
    const filename = await this.backupService.createBackup(body.type || 'all');
    return { success: true, filename };
  }

  @Post('backups/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @RequirePermission('configs:write')
  @ApiOperation({ summary: 'Restore a backup snapshot file' })
  async restoreBackup(@Body() body: { filename: string }) {
    return this.backupService.restoreBackup(body.filename);
  }
}
export default AdminController;
