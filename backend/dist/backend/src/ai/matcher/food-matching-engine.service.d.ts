import { FoodsRepository } from '../../nutrition/foods.repository';
import { FoodMatchResult } from '../../../../shared/contracts';
export declare class FoodMatchingEngine {
    private readonly foodsRepository;
    constructor(foodsRepository: FoodsRepository);
    matchFood(detectedName: string): Promise<FoodMatchResult>;
}
export default FoodMatchingEngine;
