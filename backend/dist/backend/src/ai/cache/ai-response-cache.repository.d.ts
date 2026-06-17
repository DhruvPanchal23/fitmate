import { PrismaService } from '../../prisma/prisma.service';
export declare class AIResponseCacheRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(key: string): Promise<{
        createdAt: Date;
        expiresAt: Date;
        key: string;
        value: string;
    }>;
    set(key: string, value: string, ttlSeconds: number): Promise<{
        createdAt: Date;
        expiresAt: Date;
        key: string;
        value: string;
    }>;
    clearExpired(): Promise<import("src/generated/prisma").Prisma.BatchPayload>;
    getAll(): Promise<{
        createdAt: Date;
        expiresAt: Date;
        key: string;
        value: string;
    }[]>;
    deleteAll(): Promise<import("src/generated/prisma").Prisma.BatchPayload>;
}
