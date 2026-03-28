// Stub for Plan 03 — will be replaced with full implementation in Plan 04
import { axiosInstance } from './axiosInstance';

export const authApi = {
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
