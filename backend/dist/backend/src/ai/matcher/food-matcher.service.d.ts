import { FoodMatchingEngine } from './food-matching-engine.service';
import { VisionDetectedItem, FoodMatchResult } from '../../../../shared/contracts';
export declare class FoodMatcherService {
    private readonly engine;
    constructor(engine: FoodMatchingEngine);
    matchItem(item: VisionDetectedItem): Promise<FoodMatchResult>;
}
export default FoodMatcherService;
