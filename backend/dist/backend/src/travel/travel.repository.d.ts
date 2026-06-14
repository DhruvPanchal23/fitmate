import { PrismaService } from '../prisma/prisma.service';
export declare class TravelRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActiveSession(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
    }>;
    createSession(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
    }>;
    deactivateSessions(userId: string): Promise<import("src/generated/prisma").Prisma.BatchPayload>;
    findMany(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
    }[]>;
}
