export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  gender: string;
  birthDate: string | null;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  bodyFatPercentage: number | null;
  activityLevel: string;
  goal: string;
  dietPreference: string;
  allergies: string[];
  dislikedFoods: string[];
  preferredFoods: string[];
  gymExperience: string;
  workoutDays: number;
  sleepHours: number;
  wakeUpTime: string;
  mealFrequency: number;
  measurementSystem: 'metric' | 'imperial';
  medicalNotes: string | null;
  version: number;
  updatedBy: string;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
  completionScore?: number;
}

export interface UpdateProfileRequest {
  fullName: string;
  gender: string;
  birthDate?: string;
  age: number;      // 10 to 120
  height: number;   // 50 to 300 cm
  weight: number;   // 20 to 400 kg
  targetWeight: number;
  bodyFatPercentage?: number | null; // 2 to 70 %
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  goal: 'fat_loss' | 'maintenance' | 'muscle_gain' | 'lean_bulk';
  dietPreference: 'veg' | 'vegan' | 'eggitarian' | 'non_veg';
  allergies?: string[];
  dislikedFoods?: string[];
  preferredFoods?: string[];
  gymExperience: 'beginner' | 'intermediate' | 'advanced';
  workoutDays: number; // 0 to 7
  sleepHours: number;
  wakeUpTime: string; // "HH:MM"
  mealFrequency: number;
  measurementSystem?: 'metric' | 'imperial';
  medicalNotes?: string;
}

export interface BodyMeasurementResponse {
  id: string;
  userId: string;
  weight: number;
  bodyFat: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  thighs: number | null;
  neck: number | null;
  hips: number | null;
  shoulders: number | null;
  forearms: number | null;
  calves: number | null;
  notes: string | null;
  source: 'USER' | 'APPLE_HEALTH' | 'GOOGLE_FIT' | 'GARMIN' | 'FITBIT' | 'SAMSUNG_HEALTH' | 'IMPORTED';
  createdAt: string;
}

export interface CreateBodyMeasurementRequest {
  weight: number;      // 20 to 400 kg
  bodyFat?: number;    // 2 to 70 %
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  neck?: number;
  hips?: number;
  shoulders?: number;
  forearms?: number;
  calves?: number;
  notes?: string;
  source?: 'USER' | 'APPLE_HEALTH' | 'GOOGLE_FIT' | 'GARMIN' | 'FITBIT' | 'SAMSUNG_HEALTH' | 'IMPORTED';
}

export interface ProfileCompletionResponse {
  completionScore: number; // 0 to 100
  aiReadinessScore: number; // 0 to 100
  isReadyForAI: boolean;
  missingFields: string[];
}

export interface ProgressTimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeSeriesTrend {
  weeklyChange: number;
  monthlyChange: number;
  averageGainLoss: number;
  rollingAverage: number;
  projectedTargetDate: string | null;
}

export interface ProgressTimeSeriesResponse {
  metric: string;
  unit: string;
  points: ProgressTimeSeriesPoint[];
  trend: TimeSeriesTrend;
}

export interface HealthScoreResponse {
  healthScore: number; // 0 to 100
  breakdown: {
    bmiScore: number;
    activityScore: number;
    hydrationAdherenceScore: number;
    macroAdherenceScore: number;
    bodyFatScore: number;
    sleepScore: number;
    workoutScore: number;
  };
  recommendations: string[];
}

export interface GoalRecommendationResponse {
  shouldRecommendRecalculation: boolean;
  weightChange: number; // difference in kg
  message: string | null;
}
