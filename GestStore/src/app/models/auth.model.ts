// Interfaces de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  avatar?: string;
  department?: string;
}

export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  department?: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
  timestamp?: string;
}
