import { PrismaService } from '../../prisma/prisma.service';
export declare class AIResponseCacheRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(key: string): Promise<{
        createdAt: Date;
        key: string;
        value: string;
        expiresAt: Date;
    }>;
    set(key: string, value: string, ttlSeconds: number): Promise<{
        createdAt: Date;
        key: string;
        value: string;
        expiresAt: Date;
    }>;
    clearExpired(): Promise<import("src/generated/prisma").Prisma.BatchPayload>;
}
