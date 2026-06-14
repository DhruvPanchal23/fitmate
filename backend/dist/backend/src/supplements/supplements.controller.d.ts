import { SupplementsService } from './supplements.service';
import { LogSupplementDto } from './dto/log-supplement.dto';
export declare class SupplementsController {
    private readonly supplementsService;
    constructor(supplementsService: SupplementsService);
    logSupplement(req: any, dto: LogSupplementDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }>;
    getSupplementLogs(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        unit: string;
        dosage: number;
    }[]>;
}
