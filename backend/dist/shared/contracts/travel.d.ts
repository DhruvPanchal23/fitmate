export interface ToggleTravelModeRequest {
    active: boolean;
}
export interface ToggleTravelModeResponse {
    success: boolean;
    active: boolean;
}
export interface TravelStatsResponse {
    streak: number;
    activeDays: number;
    waterTotal: number;
    scannedMealsCount: number;
}
