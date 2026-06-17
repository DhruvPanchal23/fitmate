export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface AnalyticsStreaksResponse {
  mealStreak: StreakResponse;
  workoutStreak: StreakResponse;
  hydrationStreak: StreakResponse;
}

export interface AdherenceScoreResponse {
  calories: number; // percentage Adherence (0-100)
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  overall: number;
}

export interface AnalyticsAdherenceResponse {
  weeklyAdherence: AdherenceScoreResponse;
  monthlyAdherence: AdherenceScoreResponse;
}

export interface AnalyticsHealthScoreResponse {
  score: number;
  breakdown: {
    nutrition: number;
    activity: number;
    sleep: number;
    consistency: number;
  };
  history: { date: string; score: number }[];
}

export interface AnalyticsPredictionsResponse {
  predictedWeight30Days: number;
  predictedGoalCompletionDate: string | null;
  plateauDetected: boolean;
  plateauDurationDays: number;
}

export interface InsightResponse {
  id: string;
  title: string;
  description: string;
  category: string; // plateau, macro, under_eating, over_eating, consistency, risk
  value?: number;
  dismissed: boolean;
  createdAt: string;
}

export interface RecommendationResponse {
  id: string;
  title: string;
  description: string;
  type: string; // exercise, nutrition, hydration, sleep
  actionUrl?: string;
  implemented: boolean;
  createdAt: string;
}

export interface RiskAlertResponse {
  type: string; // muscle_loss, under_eating, over_eating
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface AnalyticsDashboardResponse {
  healthScore: number;
  consistencyScore: number;
  adherenceScore: number;
  currentStreak: number;
  weightPrediction: number;
  recommendations: RecommendationResponse[];
  insights: InsightResponse[];
  riskAlerts: RiskAlertResponse[];
}

export interface TrendDataPoint {
  date: string;
  weight?: number;
  bodyFat?: number;
  caloriesConsumed?: number;
  caloriesTarget?: number;
  steps?: number;
}

export interface AnalyticsTrendsResponse {
  weekly: TrendDataPoint[];
  monthly: TrendDataPoint[];
}
