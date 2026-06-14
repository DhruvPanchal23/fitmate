import { TravelService } from './travel.service';
import { ToggleTravelModeRequest } from '../../../shared/contracts';
export declare class TravelController {
    private readonly travelService;
    constructor(travelService: TravelService);
    toggleTravel(req: any, body: ToggleTravelModeRequest): Promise<{
        success: boolean;
        active: boolean;
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
        };
    } | {
        success: boolean;
        active: boolean;
        session?: undefined;
    }>;
    getStats(req: any): Promise<{
        streak: number;
        activeDays: number;
        waterTotal: number;
        scannedMealsCount: number;
    }>;
}
export default TravelController;
