export interface MacroProgress {
  current: number;
  target: number;
}

export interface TodayLogsResponse {
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fat: MacroProgress;
  water: MacroProgress;
}
