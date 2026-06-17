import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { contextStorage } from '../common/context';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    let userId: string | undefined;
    let sessionId: string | undefined;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userId = payload.sub || payload.userId || payload.id;
          sessionId = payload.sessionId || payload.sid;
        }
      } catch {
        // Suppress parsing error, jwt guard will validate token validation
      }
    }

    const store = {
      requestId,
      userId,
      sessionId,
      startTime: Date.now(),
      dbQueriesCount: 0,
      cacheMap: new Map<string, any>(),
    };

    contextStorage.run(store, () => {
      next();
    });
  }
}
