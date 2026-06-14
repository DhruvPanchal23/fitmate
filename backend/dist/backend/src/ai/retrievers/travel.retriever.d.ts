import { TravelService } from '../../travel/travel.service';
export declare class TravelRetriever {
    private readonly travelService;
    constructor(travelService: TravelService);
    retrieve(userId: string): Promise<{
        active: boolean;
        streak: number;
        activeDays: number;
        waterTotal: number;
        scannedMealsCount: number;
    }>;
}
export default TravelRetriever;
