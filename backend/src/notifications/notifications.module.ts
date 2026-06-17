import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './notification.repository';
import { HabitRepository } from './habit.repository';
import { ReminderEngine } from './reminder.engine';
import { HabitEngine } from './habit.engine';
import { ScheduleEngine } from './schedule.engine';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    HabitRepository,
    ReminderEngine,
    HabitEngine,
    ScheduleEngine,
  ],
  exports: [
    NotificationsService,
    NotificationRepository,
    HabitRepository,
    ReminderEngine,
    HabitEngine,
    ScheduleEngine,
  ],
})
export class NotificationsModule {}
export default NotificationsModule;
