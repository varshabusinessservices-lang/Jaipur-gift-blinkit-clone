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

export const mockAuthService: AuthService = {
  async login({ email, password }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (email.trim().toLowerCase() === "admin@example.com" && password === "Admin@123") {
      return {
        user: {
          id: "mock-super-admin-id",
          name: "Super Admin",
          email: "admin@example.com",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          isSuperAdmin: true,
          mobile: "+91 9876543210",
          avatarUrl: null,
          emailVerifiedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          passwordChangedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };
    }

    throw new Error("Invalid credentials");
  },

  async forgotPassword(_email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },

  async resetPassword(_data): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

export const apiAuthService: AuthService = {
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

const useMockApi = String(import.meta.env.VITE_ADMIN_USE_MOCK_API).toLowerCase() === 'true';

export const authService: AuthService = useMockApi ? mockAuthService : apiAuthService;
