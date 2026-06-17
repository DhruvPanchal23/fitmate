import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateReminderRequest } from '../../../shared/contracts/notifications';

@ApiTags('Notifications, Reminders & Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async getNotifications(@Request() req: any) {
    // Dynamically trigger smart reminders check to ensure notifications are up-to-date
    await this.notificationsService.triggerSmartRemindersCheck(req.user.id);
    return this.notificationsService.getNotifications(req.user.id);
  }

  @Post('notifications/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markAsRead(@Request() req: any, @Body() body: { notificationIds?: string[] }) {
    return this.notificationsService.markAsRead(req.user.id, body.notificationIds);
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(req.user.id, id);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get user reminder schedules' })
  async getReminders(@Request() req: any) {
    return this.notificationsService.getReminders(req.user.id);
  }

  @Patch('reminders')
  @ApiOperation({ summary: 'Update user reminder schedules' })
  async updateReminder(@Request() req: any, @Body() body: UpdateReminderRequest) {
    return this.notificationsService.updateReminder(req.user.id, body);
  }

  @Get('habits')
  @ApiOperation({ summary: 'Get user habits listing' })
  async getHabits(@Request() req: any) {
    return this.notificationsService.getHabits(req.user.id);
  }

  @Get('habits/streaks')
  @ApiOperation({ summary: 'Get user habits streaks' })
  async getHabitStreaks(@Request() req: any) {
    return this.notificationsService.getHabitStreaks(req.user.id);
  }

  @Get('habits/analytics')
  @ApiOperation({ summary: 'Get habits completion analytics and weekly/monthly scores' })
  async getHabitAnalytics(@Request() req: any) {
    return this.notificationsService.getHabitAnalytics(req.user.id);
  }
}
export default NotificationsController;
