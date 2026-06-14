import { PrismaService } from '../prisma/prisma.service';
import { LogWaterRequest } from '../../../shared/contracts';
export declare class WaterRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: LogWaterRequest): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }>;
    findMany(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }[]>;
}
