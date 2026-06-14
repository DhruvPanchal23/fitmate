import { WaterService } from './water.service';
import { LogWaterDto } from './dto/log-water.dto';
export declare class WaterController {
    private readonly waterService;
    constructor(waterService: WaterService);
    logWater(req: any, dto: LogWaterDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }>;
    getWaterLogs(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        unit: string;
        amount: number;
    }[]>;
}
