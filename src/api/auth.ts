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

export const authAPI = {
  // Student auth
  register: async (data: RegisterRequest): Promise<Student> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  loginStudent: async (data: LoginRequest): Promise<Student> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Admin auth
  loginAdmin: async (data: AdminLoginRequest): Promise<AdminUser> => {
    const response = await apiClient.post('/auth/admin/login', data);
    return response.data;
  },

  // Logout (both roles)
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
}; 