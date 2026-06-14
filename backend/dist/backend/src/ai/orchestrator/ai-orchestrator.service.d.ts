import { VisionService } from '../vision/vision.service';
import { FoodMatcherService } from '../matcher/food-matcher.service';
import { MealScanRepository } from '../meal-scan.repository';
import { MealsService } from '../../meals/meals.service';
import { ConfirmScanRequest, ConfirmScanResponse, MealScanResponse } from '../../../../shared/contracts';
export declare class AIOrchestratorService {
    private readonly visionService;
    private readonly matcherService;
    private readonly scanRepository;
    private readonly mealsService;
    constructor(visionService: VisionService, matcherService: FoodMatcherService, scanRepository: MealScanRepository, mealsService: MealsService);
    scanImage(userId: string, imageUrl: string): Promise<MealScanResponse>;
    getScan(id: string): Promise<MealScanResponse>;
    confirmScan(userId: string, dto: ConfirmScanRequest): Promise<ConfirmScanResponse>;
    retryScan(userId: string, scanId: string): Promise<MealScanResponse>;
}
