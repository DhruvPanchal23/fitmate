import { PrismaService } from '../prisma/prisma.service';
import { LogSupplementRequest } from '../../../shared/contracts';
export declare class SupplementsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: LogSupplementRequest): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }>;
    findMany(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }[]>;
}
