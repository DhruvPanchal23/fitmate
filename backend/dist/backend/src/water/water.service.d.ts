import { WaterRepository } from './water.repository';
import { LogWaterRequest } from '../../../shared/contracts';
export declare class WaterService {
    private readonly repository;
    constructor(repository: WaterRepository);
    logWater(userId: string, dto: LogWaterRequest): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }>;
    getWaterLogs(userId: string, dateStr?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }[]>;
}
