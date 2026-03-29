import { axiosInstance } from '../axiosInstance';
import type { DashboardStats } from '../../types/api';

export const adminDashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data.data;
  },
};
