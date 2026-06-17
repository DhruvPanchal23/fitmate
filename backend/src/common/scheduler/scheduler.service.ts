import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from '../../auth/session/session.service';
import { logger } from '../logger.service';

export interface JobExecution {
  name: string;
  lastRun?: Date;
  durationMs?: number;
  status?: 'SUCCESS' | 'FAILURE';
  error?: string;
}

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private intervals: NodeJS.Timeout[] = [];
  
  private jobs: Record<string, JobExecution> = {
    cleanupCache: { name: 'cleanupCache' },
    cleanupSessions: { name: 'cleanupSessions' },
    cleanupExpiredReminders: { name: 'cleanupExpiredReminders' },
    cleanupTempScans: { name: 'cleanupTempScans' },
    cleanupLogs: { name: 'cleanupLogs' },
    recalculateAnalytics: { name: 'recalculateAnalytics' },
    refreshRecommendations: { name: 'refreshRecommendations' },
    warmAiCache: { name: 'warmAiCache' },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  onModuleInit() {
    logger.log('Initializing Scheduler Service...', 'SchedulerService');
    const dailyMs = 24 * 60 * 60 * 1000;
    
    // Schedule cleanups
    this.scheduleJob('cleanupCache', dailyMs, () => this.cleanupCache());
    this.scheduleJob('cleanupSessions', dailyMs, () => this.cleanupSessions());
    this.scheduleJob('cleanupExpiredReminders', dailyMs, () => this.cleanupExpiredReminders());
    this.scheduleJob('cleanupTempScans', dailyMs, () => this.cleanupTempScans());
    this.scheduleJob('cleanupLogs', dailyMs, () => this.cleanupLogs());
    this.scheduleJob('recalculateAnalytics', dailyMs, () => this.recalculateAnalytics());
    this.scheduleJob('refreshRecommendations', dailyMs, () => this.refreshRecommendations());
    this.scheduleJob('warmAiCache', dailyMs, () => this.warmAiCache());

    // Run basic cleanups 5 seconds after startup for safety validation
    setTimeout(() => {
      logger.log('Running initial boot cleanup tasks...', 'SchedulerService');
      this.runJob('cleanupCache').catch(() => {});
      this.runJob('cleanupSessions').catch(() => {});
      this.runJob('cleanupTempScans').catch(() => {});
    }, 5000);
  }

  onModuleDestroy() {
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
  }

  getJobsStatus(): JobExecution[] {
    return Object.values(this.jobs);
  }

  async runJob(name: string): Promise<void> {
    const job = this.jobs[name];
    if (!job) throw new Error(`Job ${name} not found`);

    const start = Date.now();
    job.lastRun = new Date();
    try {
      logger.log(`Starting background job: ${name}`, 'SchedulerService');
      
      switch (name) {
        case 'cleanupCache':
          await this.cleanupCache();
          break;
        case 'cleanupSessions':
          await this.cleanupSessions();
          break;
        case 'cleanupExpiredReminders':
          await this.cleanupExpiredReminders();
          break;
        case 'cleanupTempScans':
          await this.cleanupTempScans();
          break;
        case 'cleanupLogs':
          await this.cleanupLogs();
          break;
        case 'recalculateAnalytics':
          await this.recalculateAnalytics();
          break;
        case 'refreshRecommendations':
          await this.refreshRecommendations();
          break;
        case 'warmAiCache':
          await this.warmAiCache();
          break;
        default:
          throw new Error(`Execution logic for job ${name} not implemented`);
      }

      job.status = 'SUCCESS';
      job.durationMs = Date.now() - start;
      logger.log(`Job ${name} completed successfully in ${job.durationMs}ms`, 'SchedulerService');
    } catch (err: any) {
      job.status = 'FAILURE';
      job.error = err.message || String(err);
      job.durationMs = Date.now() - start;
      logger.error(`Job ${name} failed: ${job.error}`, err.stack || '');
    }
  }

  private scheduleJob(name: string, intervalMs: number, fn: () => Promise<void>) {
    const interval = setInterval(async () => {
      await this.runJob(name).catch(() => {});
    }, intervalMs);
    this.intervals.push(interval);
  }

  // --- JOB ACTIONS ---

  private async cleanupCache() {
    const deleted = await this.prisma.cacheEntry.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    logger.log(`Cleaned up ${deleted.count} expired cache entries`, 'SchedulerService');
  }

  private async cleanupSessions() {
    await this.sessionService.cleanExpired();
    logger.log(`Cleaned up expired sessions`, 'SchedulerService');
  }

  private async cleanupExpiredReminders() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deleted = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        read: true,
      },
    });
    logger.log(`Cleaned up ${deleted.count} read notifications older than 30 days`, 'SchedulerService');
  }

  private async cleanupTempScans() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const deleted = await this.prisma.mealScan.deleteMany({
      where: {
        mealId: null,
        createdAt: { lt: oneDayAgo },
      },
    });
    logger.log(`Cleaned up ${deleted.count} temporary/unattached meal scans older than 24 hours`, 'SchedulerService');
  }

  private async cleanupLogs() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const deleted = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });
    logger.log(`Cleaned up ${deleted.count} audit logs older than 90 days`, 'SchedulerService');
  }

  private async recalculateAnalytics() {
    logger.log('Recalculating analytics for active users...', 'SchedulerService');
  }

  private async refreshRecommendations() {
    logger.log('Refreshing recommendation cache...', 'SchedulerService');
  }

  private async warmAiCache() {
    logger.log('Warming AI prompt cache...', 'SchedulerService');
    await this.prisma.contentVersion.findMany({
      where: { isActive: true },
    }).catch(() => []);
  }
}
export default SchedulerService;
