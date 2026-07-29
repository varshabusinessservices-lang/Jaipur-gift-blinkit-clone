import { apiClient } from '../lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  mobile?: string | null;
  avatarUrl?: string | null;
  status?: string;
  isSuperAdmin?: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(data: { token: string; password: string }): Promise<void>;
}

export const authService: AuthService = {
  async login(credentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Invalid credentials");
    } catch (error: any) {
      if (!error.response) {
        throw new Error("Backend service unavailable. Please check backend connection.");
      }
      throw new Error(error.response?.data?.message || "Invalid credentials");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword({ token, password }): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, password });
  },
};

