import { Injectable } from '@nestjs/common';
import { Chunk } from './embedding.service';

@Injectable()
export class ChunkService {
  chunkProfile(profile: any): Chunk {
    return {
      id: `profile-${profile.userId}`,
      source: 'UserProfile',
      content: `User Profile: Name is ${profile.fullName}, Gender: ${profile.gender}, Age: ${profile.age}. Height: ${profile.height}cm, Weight: ${profile.weight}kg, Goal: ${profile.goal}, Activity Level: ${profile.activityLevel}, Target Weight: ${profile.targetWeight}kg.`
    };
  }

  chunkGoals(goals: any[]): Chunk[] {
    return goals.map((g, idx) => ({
      id: `goal-history-${g.id || idx}`,
      source: 'GoalHistory',
      content: `Goal History Snapshot: Active Formula: ${g.calculationFormula || 'Mifflin-St Jeor'}, Calorie Budget: ${g.targetCalories || g.calories} kcal, Protein target: ${g.protein || 0}g, Carbs target: ${g.carbs || 0}g, Fat target: ${g.fat || 0}g. Generated on: ${g.createdAt || g.generatedAt || new Date().toISOString()}`
    }));
  }

  chunkMeals(meals: any[]): Chunk[] {
    return meals.map((m, idx) => ({
      id: `meal-history-${m.id || idx}`,
      source: 'MealHistory',
      content: `Logged Meal (${m.mealType}): Consumed ${m.foodName || m.name || 'food'} with quantity ${m.quantity || 1} ${m.unit || 'serving'}. Macros: ${m.calories || 0} kcal, Protein: ${m.protein || 0}g, Carbs: ${m.carbohydrates || m.carbs || 0}g, Fat: ${m.fats || m.fat || 0}g.`
    }));
  }

  chunkTravel(travelSessions: any[]): Chunk[] {
    return travelSessions.map((t, idx) => ({
      id: `travel-mode-${t.id || idx}`,
      source: 'TravelMode',
      content: `Travel Session: Trip from ${t.origin || 'Home'} to ${t.destination || 'Away'} between ${t.startDate} and ${t.endDate}. Active Compensation: estimated daily calorie surplus is ${t.estimatedSurplus || 0} kcal. Status: ${t.status}.`
    }));
  }

  chunkAnalytics(analytics: any[]): Chunk[] {
    return analytics.map((a, idx) => ({
      id: `analytics-snapshot-${a.id || idx}`,
      source: 'Analytics',
      content: `Daily Health Snapshot: Health Score is ${a.healthScore || a.score || 0}/100, Adherence: ${a.adherenceScore || 0}%, Consistency: ${a.consistencyScore || 0}%, Water Logged: ${a.waterVolume || 0}ml.`
    }));
  }

  chunkNotificationsAndHabits(notifications: any[], habits: any[]): Chunk[] {
    const chunks: Chunk[] = [];
    notifications.forEach((n, idx) => {
      chunks.push({
        id: `notification-${n.id || idx}`,
        source: 'Notifications',
        content: `Reminder Action log: Alert titled "${n.title || n.action}" was delivered. Content: "${n.body || n.content}". Read Status: ${n.read ? 'Opened' : 'Unopened'}.`
      });
    });
    habits.forEach((h, idx) => {
      chunks.push({
        id: `habit-${h.id || idx}`,
        source: 'Habits',
        content: `Habit tracker: "${h.name}" has current streak of ${h.streak || 0} days, weekly completion rate is ${h.completionRate || 0}%.`
      });
    });
    return chunks;
  }
}
export default ChunkService;
