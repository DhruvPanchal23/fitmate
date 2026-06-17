import { AIResponseCacheRepository } from './ai-response-cache.repository';
export declare class AIResponseCacheService {
    private readonly repository;
    constructor(repository: AIResponseCacheRepository);
    private generateKey;
    getCachedResponse(params: {
        prompt: string;
        profileVersion: number;
        engineVersion: string;
        provider: string;
        promptVersion: number;
    }): Promise<string | null>;
    cacheResponse(params: {
        prompt: string;
        profileVersion: number;
        engineVersion: string;
        provider: string;
        promptVersion: number;
    }, response: string, ttlSeconds?: number): Promise<void>;
    getCacheStats(): Promise<{
        totalEntries: number;
        cacheHits: number;
        cacheMisses: number;
    }>;
    clearCache(): Promise<void>;
}
export default AIResponseCacheService;
