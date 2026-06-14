import { AIResponseCacheRepository } from './ai-response-cache.repository';
export declare class AIResponseCacheService {
    private readonly repository;
    constructor(repository: AIResponseCacheRepository);
    private generateKey;
    getCachedResponse(prompt: string): Promise<string | null>;
    cacheResponse(prompt: string, response: string, ttlSeconds?: number): Promise<void>;
}
export default AIResponseCacheService;
