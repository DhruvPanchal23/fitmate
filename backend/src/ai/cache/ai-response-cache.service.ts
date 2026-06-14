import { Injectable } from '@nestjs/common';
import { AIResponseCacheRepository } from './ai-response-cache.repository';
import * as crypto from 'crypto';

@Injectable()
export class AIResponseCacheService {
  constructor(private readonly repository: AIResponseCacheRepository) {}

  private generateKey(prompt: string): string {
    // Normalize prompt and hash it using sha256
    const normalized = prompt.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  async getCachedResponse(prompt: string): Promise<string | null> {
    const key = this.generateKey(prompt);
    const entry = await this.repository.get(key);
    return entry ? entry.value : null;
  }

  async cacheResponse(prompt: string, response: string, ttlSeconds = 3600): Promise<void> {
    const key = this.generateKey(prompt);
    await this.repository.set(key, response, ttlSeconds);
    // Proactively clean expired entries in background
    this.repository.clearExpired().catch(() => {});
  }
}
export default AIResponseCacheService;
