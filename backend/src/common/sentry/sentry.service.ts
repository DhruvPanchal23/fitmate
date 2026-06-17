import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private sentryInstance: any = null;
  private readonly isInitialized: boolean = false;

  constructor() {
    const dsn = process.env.SENTRY_DSN;
    const release = process.env.RELEASE_VERSION || 'fitmate-backend@1.0.0';
    const environment = process.env.NODE_ENV || 'development';

    if (!dsn || dsn.trim() === '') {
      this.logger.log('Sentry Error Tracking: DISABLED (No SENTRY_DSN provided. Falling back to local logging)');
      return;
    }

    try {
      // Dynamic load to keep dependency optional during testing/dev if needed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/node');
      Sentry.init({
        dsn,
        release,
        environment,
        tracesSampleRate: 0.1, // 10% of transactions for performance tracing
      });
      this.sentryInstance = Sentry;
      this.isInitialized = true;
      this.logger.log(`Sentry Error Tracking: INITIALIZED (Release: ${release}, Env: ${environment})`);
    } catch (err) {
      this.logger.warn(`Sentry Error Tracking: FAILED to load Sentry SDK: ${err.message}`);
    }
  }

  captureException(exception: any, context?: Record<string, any>) {
    if (this.isInitialized && this.sentryInstance) {
      this.sentryInstance.withScope((scope: any) => {
        if (context) {
          scope.setExtras(context);
          if (context.userId) scope.setUser({ id: context.userId });
          if (context.requestId) scope.setTag('requestId', context.requestId);
        }
        this.sentryInstance.captureException(exception);
      });
    } else {
      this.logger.debug(`[Local Log Capture] Exception: ${exception.message || exception}. Context: ${JSON.stringify(context || {})}`);
    }
  }
}
export default SentryService;
