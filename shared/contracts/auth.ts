export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
}

export interface RegisterResponse {
  success: boolean;
  userId?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UserResponseData {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserResponseData;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
}
