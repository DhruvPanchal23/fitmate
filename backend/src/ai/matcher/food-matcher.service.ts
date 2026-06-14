import { Injectable } from '@nestjs/common';
import { FoodMatchingEngine } from './food-matching-engine.service';
import { VisionDetectedItem, FoodMatchResult } from '../../../../shared/contracts';

@Injectable()
export class FoodMatcherService {
  constructor(private readonly engine: FoodMatchingEngine) {}

  async matchItem(item: VisionDetectedItem): Promise<FoodMatchResult> {
    return this.engine.matchFood(item.foodName);
  }
}
export default FoodMatcherService;
