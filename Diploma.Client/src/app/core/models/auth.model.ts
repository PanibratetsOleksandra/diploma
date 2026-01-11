export interface AuthResponse {
  token: string;
  // Можно добавить поля, если бэкенд возвращает больше данных
  // expiration: string;
  // user: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}