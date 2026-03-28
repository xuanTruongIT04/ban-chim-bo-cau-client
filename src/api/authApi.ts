import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse, UserProfile } from '../types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<UserProfile>('/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
