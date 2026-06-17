import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService, Chunk } from './embedding.service';
import { ChunkService } from './chunk.service';

@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly chunkService: ChunkService
  ) {}

  async retrieveRelevantContext(userId: string, query: string, limit: number = 5): Promise<Chunk[]> {
    // 1. Fetch user data in parallel
    const [
      profile,
      goalHistories,
      meals,
      travelSessions,
      analyticsSnapshots,
      notifications,
      habits,
      mealPlans
    ] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.goalHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
      this.prisma.meal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.travelSession.findMany({ where: { userId }, orderBy: { startDate: 'desc' }, take: 2 }),
      this.prisma.analyticsSnapshot.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 }),
      this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.habit.findMany({ where: { userId }, take: 5 }),
      this.prisma.mealPlan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 2 })
    ]);

    // 2. Generate chunks
    const allChunks: Chunk[] = [];

    if (profile) {
      allChunks.push(this.chunkService.chunkProfile(profile));
    }
    if (goalHistories && goalHistories.length > 0) {
      allChunks.push(...this.chunkService.chunkGoals(goalHistories));
    }
    if (meals && meals.length > 0) {
      // Map database Meal records
      const mealItems = meals.map(m => ({
        mealType: m.mealType,
        foodName: m.source, // fallback
        quantity: 1,
        unit: 'serving',
        calories: 250, // mock fallback macro
        protein: 15,
        carbs: 20,
        fat: 8
      }));
      allChunks.push(...this.chunkService.chunkMeals(mealItems));
    }
    if (travelSessions && travelSessions.length > 0) {
      allChunks.push(...this.chunkService.chunkTravel(travelSessions));
    }
    if (analyticsSnapshots && analyticsSnapshots.length > 0) {
      allChunks.push(...this.chunkService.chunkAnalytics(analyticsSnapshots));
    }
    allChunks.push(...this.chunkService.chunkNotificationsAndHabits(notifications || [], habits || []));

    // Also include active meal plan chunks if they exist
    if (mealPlans && mealPlans.length > 0) {
      mealPlans.forEach((plan, idx) => {
        allChunks.push({
          id: `meal-plan-${plan.id || idx}`,
          source: 'MealPlanner',
          content: `Active Meal Plan: "${plan.title}" for goals "${plan.goal}" with daily targets: ${plan.caloriesTarget} kcal, Protein: ${plan.proteinTarget}g, Carbs: ${plan.carbsTarget}g, Fat: ${plan.fatTarget}g.`
        });
      });
    }

    // 3. Compute vector rankings
    const queryVector = this.embeddingService.generateEmbedding(query);
    
    const chunksWithScores = allChunks.map(chunk => {
      const chunkVector = this.embeddingService.generateEmbedding(chunk.content);
      const score = this.embeddingService.cosineSimilarity(queryVector, chunkVector);
      return { ...chunk, score };
    });

    // 4. Sort and return top K
    return chunksWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        source: item.source,
        content: item.content
      }));
  }

  async assembleContext(userId: string, query: string, limit: number = 5): Promise<string> {
    const relevantChunks = await this.retrieveRelevantContext(userId, query, limit);
    if (relevantChunks.length === 0) return 'No relevant history records found.';
    
    return relevantChunks
      .map(c => `[Source: ${c.source}] ${c.content}`)
      .join('\n\n');
  }
}
export default RetrievalService;
