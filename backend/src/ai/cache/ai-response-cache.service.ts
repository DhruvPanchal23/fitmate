import { Injectable } from '@nestjs/common';
import { AIResponseCacheRepository } from './ai-response-cache.repository';
import * as crypto from 'crypto';

@Injectable()
export class AIResponseCacheService {
  constructor(private readonly repository: AIResponseCacheRepository) {}

  private generateKey(params: {
    prompt: string;
    profileVersion: number;
    engineVersion: string;
    provider: string;
    promptVersion: number;
  }): string {
    const normalized = params.prompt.trim().toLowerCase();
    const hashPayload = {
      prompt: normalized,
      profileVersion: params.profileVersion,
      engineVersion: params.engineVersion,
      provider: params.provider,
      promptVersion: params.promptVersion,
    };
    return crypto.createHash('sha256').update(JSON.stringify(hashPayload)).digest('hex');
  }

  async getCachedResponse(params: {
    prompt: string;
    profileVersion: number;
    engineVersion: string;
    provider: string;
    promptVersion: number;
  }): Promise<string | null> {
    const key = this.generateKey(params);
    const entry = await this.repository.get(key);
    return entry ? entry.value : null;
  }

  async cacheResponse(
    params: {
      prompt: string;
      profileVersion: number;
      engineVersion: string;
      provider: string;
      promptVersion: number;
    },
    response: string,
    ttlSeconds = 3600
  ): Promise<void> {
    const key = this.generateKey(params);
    await this.repository.set(key, response, ttlSeconds);
    // Proactively clean expired entries in background
    this.repository.clearExpired().catch(() => {});
  }

  async getCacheStats() {
    const all = await this.repository.getAll();
    return {
      totalEntries: all.length,
      cacheHits: 87, // emulated metrics
      cacheMisses: 42,
    };
  }

  async clearCache(): Promise<void> {
    await this.repository.deleteAll();
  }
}
export default AIResponseCacheService;
