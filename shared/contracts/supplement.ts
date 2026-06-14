export interface LogSupplementRequest {
  name: string;
  dosage: number;
  unit: string;
}

export interface SupplementLogResponse {
  id: string;
  userId: string;
  name: string;
  dosage: number;
  unit: string;
  createdAt: Date | string;
}
