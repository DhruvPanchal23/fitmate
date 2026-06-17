import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { getRequestContext } from '../common/context';

@Injectable()
export class QueryPerformanceService implements OnModuleInit {
  private readonly logger = new Logger('QueryPerformance');
  private totalQueries = 0;
  private slowQueries = 0;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    try {
      (this.prisma as any).$on('query', (event: any) => {
        this.totalQueries++;
        const duration = event.duration;
        const query = event.query;
        const params = event.params;

        const store = getRequestContext();
        if (store) {
          store.dbQueriesCount++;
        }
        
        if (duration > 200) {
          this.slowQueries++;
          this.logger.warn(
            `[SLOW QUERY] ${duration}ms | Query: ${query} | Params: ${params}`
          );
        }
      });
      this.logger.log('Prisma query performance monitoring initialized.');
    } catch (e) {
      this.logger.warn(`Could not hook Prisma query events (this is expected during test/mock runs): ${e.message}`);
    }
  }

  getMetrics() {
    return {
      totalQueries: this.totalQueries,
      slowQueries: this.slowQueries,
    };
  }
}
export default QueryPerformanceService;
