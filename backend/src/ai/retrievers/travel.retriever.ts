import { Injectable } from '@nestjs/common';
import { TravelService } from '../../travel/travel.service';

@Injectable()
export class TravelRetriever {
  constructor(private readonly travelService: TravelService) {}

  async retrieve(userId: string) {
    try {
      const active = await this.travelService.isTravelModeActive(userId);
      const stats = await this.travelService.getTravelStats(userId);
      return {
        active,
        streak: stats.streak,
        activeDays: stats.activeDays,
        waterTotal: stats.waterTotal,
        scannedMealsCount: stats.scannedMealsCount,
      };
    } catch (e) {
      return {
        active: false,
        streak: 0,
        activeDays: 0,
        waterTotal: 0,
        scannedMealsCount: 0,
      };
    }
  }
}
export default TravelRetriever;
