export interface LogWaterRequest {
  amount: number;
  unit: string;
}

export interface WaterLogResponse {
  id: string;
  userId: string;
  amount: number;
  unit: string;
  createdAt: Date | string;
}
