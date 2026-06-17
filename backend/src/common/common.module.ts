import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ErrorService } from './errors/error.service';
import { BackupService } from './backup/backup.service';
import { SchedulerService } from './scheduler/scheduler.service';
import { SentryService } from './sentry/sentry.service';

@Global()
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ErrorService, BackupService, SchedulerService, SentryService],
  exports: [ErrorService, BackupService, SchedulerService, SentryService],
})
export class CommonModule {}
export default CommonModule;
