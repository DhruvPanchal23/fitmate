import { TravelRepository } from './travel.repository';
import { PrismaService } from '../prisma/prisma.service';
export declare class TravelService {
    private readonly repository;
    private readonly prisma;
    constructor(repository: TravelRepository, prisma: PrismaService);
    toggleTravelMode(userId: string, active: boolean): Promise<{
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
    isTravelModeActive(userId: string): Promise<boolean>;
    getTravelStats(userId: string): Promise<{
        streak: number;
        activeDays: number;
        waterTotal: number;
        scannedMealsCount: number;
    }>;
}
