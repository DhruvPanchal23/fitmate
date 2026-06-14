import { SupplementsRepository } from './supplements.repository';
import { LogSupplementRequest } from '../../../shared/contracts';
export declare class SupplementsService {
    private readonly repository;
    constructor(repository: SupplementsRepository);
    logSupplement(userId: string, dto: LogSupplementRequest): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }>;
    getSupplementLogs(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }[]>;
}
