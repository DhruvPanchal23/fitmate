import { Injectable } from '@nestjs/common';
import { ProfileRetriever } from '../retrievers/profile.retriever';
import { NutritionRetriever } from '../retrievers/nutrition.retriever';
import { MealHistoryRetriever } from '../retrievers/meal-history.retriever';
import { ExerciseRetriever } from '../retrievers/exercise.retriever';
import { TravelRetriever } from '../retrievers/travel.retriever';
import { AnalyticsRetriever } from '../retrievers/analytics.retriever';
import { NotificationsRetriever } from '../retrievers/notifications.retriever';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly profileRetriever: ProfileRetriever,
    private readonly nutritionRetriever: NutritionRetriever,
    private readonly mealHistoryRetriever: MealHistoryRetriever,
    private readonly exerciseRetriever: ExerciseRetriever,
    private readonly travelRetriever: TravelRetriever,
    private readonly analyticsRetriever: AnalyticsRetriever,
    private readonly notificationsRetriever: NotificationsRetriever,
    private readonly prisma: PrismaService,
  ) {}

  async buildContext(userId: string) {
    const [
      profile,
      nutrition,
      meals,
      exercise,
      travel,
      analytics,
      notifications,
      scansRaw,
    ] = await Promise.all([
      this.profileRetriever.retrieve(userId),
      this.nutritionRetriever.retrieve(userId),
      this.mealHistoryRetriever.retrieve(userId),
      this.exerciseRetriever.retrieve(userId),
      this.travelRetriever.retrieve(userId),
      this.analyticsRetriever.retrieve(userId),
      this.notificationsRetriever.retrieve(userId),
      this.prisma.mealScan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    const recentScans = scansRaw.map((s) => ({
      id: s.id,
      model: s.model,
      confidence: s.confidence,
      status: s.status,
      createdAt: s.createdAt.toISOString().split('T')[0],
    }));

    return {
      profile,
      nutrition,
      meals,
      exercise,
      travel,
      analytics,
      notifications,
      recentScans,
    };
  }
}
export default ContextBuilderService;
