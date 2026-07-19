// src/api/auth.ts
// import { apiClient } from '../lib/api-client'; // Uncomment when using real API
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Mock implementation - replace with real API call
    // return apiClient.post<AuthResponse>('/auth/login', credentials);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock user data
    const mockUser: User = {
      id: Date.now().toString(),
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 123-4567',
      avatar: `https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Mock implementation
    // return apiClient.post<AuthResponse>('/auth/register', data);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=3b82f6&color=fff`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  },

  // Logout user
  logout: async (): Promise<void> => {
    // Mock implementation
    // return apiClient.post<void>('/auth/logout');

    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem('token');
  },

  // Refresh token
  refreshToken: async (_refreshToken: string): Promise<AuthResponse> => {
    // Mock implementation
    // return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });

    await new Promise((resolve) => setTimeout(resolve, 500));

    throw new Error('Not implemented in mock');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    // Mock implementation
    // return apiClient.get<User>('/auth/me');

    await new Promise((resolve) => setTimeout(resolve, 300));

    throw new Error('Not implemented in mock');
  },

  // Update user profile
  updateProfile: async (_data: Partial<User>): Promise<User> => {
    // Mock implementation
    //return apiClient.patch<User>('/auth/profile', data);

    await new Promise((resolve) => setTimeout(resolve, 500));

    throw new Error('Not implemented in mock');
  },
};