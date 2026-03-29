import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse, UserProfile } from '../types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/admin/login', data);
    // Backend trả response có prefix "file" trước JSON — cần parse thủ công
    let body = response.data;
    if (typeof body === 'string') {
      const jsonStart = body.indexOf('{');
      if (jsonStart > 0) {
        body = JSON.parse(body.substring(jsonStart));
      }
    }
    return {
      access_token: body.data.token,
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
