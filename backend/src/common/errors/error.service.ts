import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { logger } from '../logger.service';

export enum ErrorCategory {
  VALIDATION = 'Validation',
  BUSINESS = 'Business',
  DATABASE = 'Database',
  PROVIDER = 'Provider',
  NETWORK = 'Network',
  UNEXPECTED = 'Unexpected',
}

export interface ErrorRecord {
  id: string;
  category: ErrorCategory;
  message: string;
  stack?: string;
  metadata?: any;
  timestamp: string;
}

@Injectable()
export class ErrorService {
  private readonly logFilePath = path.join(process.cwd(), 'logs', 'critical-errors.json');
  private errorsInMemory: ErrorRecord[] = [];

  constructor() {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      logger.error('Failed to create logs directory', err);
    }
  }

  trackError(category: ErrorCategory, error: any, metadata?: any): ErrorRecord {
    const id = randomUUID();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const timestamp = new Date().toISOString();

    const record: ErrorRecord = {
      id,
      category,
      message,
      stack,
      metadata,
      timestamp,
    };

    // Keep in memory (cap at 100)
    this.errorsInMemory.unshift(record);
    if (this.errorsInMemory.length > 100) {
      this.errorsInMemory.pop();
    }

    // Persist to file if critical or unexpected
    if (category === ErrorCategory.UNEXPECTED || category === ErrorCategory.DATABASE) {
      this.persistToFile(record);
    }

    // Log the error
    logger.error(`[Error ID: ${id}] [${category}] ${message}`, stack || '');

    return record;
  }

  private persistToFile(record: ErrorRecord) {
    try {
      let logs: ErrorRecord[] = [];
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf-8');
        if (fileContent) {
          try {
            logs = JSON.parse(fileContent);
          } catch {
            logs = [];
          }
        }
      }
      logs.unshift(record);
      if (logs.length > 500) {
        logs = logs.slice(0, 500);
      }
      fs.writeFileSync(this.logFilePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to write critical error to log file', err);
    }
  }

  getRecentErrors(): ErrorRecord[] {
    return this.errorsInMemory;
  }

  getCriticalErrorsFromFile(): ErrorRecord[] {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf-8');
        return fileContent ? JSON.parse(fileContent) : [];
      }
    } catch (err) {
      logger.error('Failed to read critical errors from log file', err);
    }
    return [];
  }
}
export default ErrorService;
