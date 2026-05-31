export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}