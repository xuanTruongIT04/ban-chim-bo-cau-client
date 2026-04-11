import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse, UserProfile } from '../types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/admin/login', data);
    return {
      access_token: response.data.data.token,
      token_type: 'Bearer',
    };
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/admin/me');
    return response.data.data as UserProfile;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/admin/logout');
  },
};
