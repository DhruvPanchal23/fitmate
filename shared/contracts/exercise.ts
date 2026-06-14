export interface LogExerciseRequest {
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface ExerciseLogResponse {
  id: string;
  userId: string;
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  createdAt: Date | string;
}
