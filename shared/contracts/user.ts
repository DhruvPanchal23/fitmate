export interface UserProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user?: {
    email: string;
  };
}

export interface UpdateProfileRequest {
  fullName: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
}
