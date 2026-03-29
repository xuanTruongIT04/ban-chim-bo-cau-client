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
    // TODO: Backend chưa có route /me — tạm decode từ token hoặc bỏ qua
    // Khi backend thêm route, uncomment dòng dưới:
    // const response = await axiosInstance.get<UserProfile>('/admin/me');
    // return response.data;
    throw new Error('GET /me not implemented in backend');
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/admin/logout');
  },
};
