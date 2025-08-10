import { apiClient } from './client';
import type { Student, AdminUser } from '../types';

export interface RegisterRequest {
  studentId: string;
  name: string;
  school: string;
}

export interface LoginRequest {
  studentId: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface StudentAuthResponse extends Student {
  token: string;
}

export interface AdminAuthResponse extends AdminUser {
  token: string;
}

export const authAPI = {
  // Student auth
  register: async (data: RegisterRequest): Promise<StudentAuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  loginStudent: async (data: LoginRequest): Promise<StudentAuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Admin auth
  loginAdmin: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/auth/admin/login', data);
    return response.data;
  },

  // Logout (both roles)
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
}; 