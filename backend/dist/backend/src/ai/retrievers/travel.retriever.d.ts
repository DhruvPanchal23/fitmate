import { TravelService } from '../../travel/travel.service';
export declare class TravelRetriever {
    private readonly travelService;
    constructor(travelService: TravelService);
    retrieve(userId: string): Promise<{
        active: boolean;
        destination: string;
        timezone: string;
        purpose: string;
        startDate: Date;
        liveSurplus: any;
        hasRecoveryPlan: boolean;
        recoveryPlan: {
            totalSurplusCalories: number;
            dailyReductionCalories: number;
            recoveryDays: number;
            currentDayNumber: number;
            percentage: number;
            status: string;
            todayTarget: import("../../../../shared/contracts").RecoveryDayResponse;
        };
    }>;
}
export default TravelRetriever;
