export interface StartTravelRequest {
  destination?: string;
  timezone?: string;
  purpose?: string;
}

export interface EndTravelRequest {
  // Can be empty or contain metadata
}

export interface TravelDailySummaryResponse {
  id: string;
  travelSessionId: string;
  date: string; // ISO string
  caloriesConsumed: number;
  caloriesTarget: number;
  surplus: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  exerciseCalories: number;
  steps: number;
}

export interface TravelSessionResponse {
  id: string;
  userId: string;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  destination: string | null;
  timezone: string | null;
  purpose: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  liveSurplus?: number;
  dailySummaries?: TravelDailySummaryResponse[];
  compensationPlan?: CompensationPlanResponse | null;
}

export interface CompensationPlanResponse {
  id: string;
  userId: string;
  travelSessionId: string;
  totalSurplusCalories: number;
  dailyReductionCalories: number;
  recoveryDays: number;
  recommendedWalkingMinutes: number;
  recommendedCardioMinutes: number;
  recommendedStrengthSessions: number;
  status: string; // 'active' | 'completed' | 'cancelled'
  createdAt: string;
}

export interface RecoveryDayResponse {
  dayNumber: number;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  recommendedSteps: number;
  recommendedWalkingMinutes: number;
  recommendedCardioMinutes: number;
  recommendedStrengthSessions: number;
  activities: string[];
}

export interface TravelAnalyticsResponse {
  totalDays: number;
  totalSurplus: number;
  averageCalorieSurplus: number;
  averageProteinDeviation: number;
  averageSteps: number;
  averageWater: number;
  dailySurpluses: {
    date: string;
    surplus: number;
    caloriesConsumed: number;
    caloriesTarget: number;
  }[];
}
