import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface ThrottleOptions {
  limit: number;
  ttlSeconds: number;
  keyPrefix?: string;
}

// Decorator definition
export const Throttle = (options: ThrottleOptions) => SetMetadata('throttle', options);

class InMemoryRateLimiter {
  private store = new Map<string, { count: number; expiresAt: number }>();

  async get(key: string): Promise<{ count: number; expiresAt: number } | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item;
  }

  async set(key: string, value: { count: number; expiresAt: number }): Promise<void> {
    this.store.set(key, value);
  }

  async incr(key: string, ttlSeconds: number): Promise<number> {
    const item = await this.get(key);
    const expiresAt = item ? item.expiresAt : Date.now() + ttlSeconds * 1000;
    const count = item ? item.count + 1 : 1;
    await this.set(key, { count, expiresAt });
    return count;
  }
}

const storage = new InMemoryRateLimiter();

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // 1. Resolve throttle configuration from metadata decorator
    const options = this.reflector.get<ThrottleOptions>('throttle', handler);
    
    const ip = request.ip || request.connection?.remoteAddress || '127.0.0.1';
    const userId = request.user?.id;
    
    // Default limit configuration based on route paths if decorator is not explicitly declared
    let limit = 100; // Global default per IP
    let ttlSeconds = 60;
    let key = `global:${ip}`;

    const url = request.url || '';

    if (options) {
      limit = options.limit;
      ttlSeconds = options.ttlSeconds;
      const prefix = options.keyPrefix || 'default';
      key = userId ? `user:${prefix}:${userId}` : `ip:${prefix}:${ip}`;
    } else {
      // Dynamic fallback route rules (Automatic Rate Limiting Configuration)
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        limit = 5; // Login limiter: 5 per minute
        key = `login:${ip}`;
      } else if (url.includes('/ai/scan') || url.includes('/ai/confirm') || url.includes('/ai/retry')) {
        limit = 5; // Food Scan limiter
        key = userId ? `user:scan:${userId}` : `ip:scan:${ip}`;
      } else if (url.includes('/ai/chat') || url.includes('/ai/chat/stream') || url.includes('/ai/regenerate')) {
        limit = 5; // AI Coach chats limiter
        key = userId ? `user:ai:${userId}` : `ip:ai:${ip}`;
      } else if (url.includes('/meal-planner/generate') || url.includes('/meal-planner/regenerate')) {
        limit = 5; // Meal Planner generator limiter
        key = userId ? `user:planner:${userId}` : `ip:planner:${ip}`;
      } else if (url.includes('/admin/')) {
        limit = 10; // Admin CMS limiter
        key = userId ? `user:admin:${userId}` : `ip:admin:${ip}`;
      } else if (userId) {
        // Authenticated users global: 60 per minute
        limit = 60;
        key = `user:global:${userId}`;
      }
    }

    const currentCount = await storage.incr(key, ttlSeconds);
    if (currentCount > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `API rate limit exceeded. Please wait before retrying. Limit is ${limit} requests per ${ttlSeconds}s.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
export default RateLimiterGuard;
