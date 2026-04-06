import { axiosInstance } from '../axiosInstance';
import type { AdminCategoryResource, CreateCategoryPayload } from '../../types/api';

export const adminCategoryApi = {
  list: async (): Promise<AdminCategoryResource[]> => {
    const response = await axiosInstance.get('/admin/categories');
    return response.data.data ?? response.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<AdminCategoryResource> => {
    const response = await axiosInstance.post('/admin/categories', payload);
    return response.data.data;
  },

  update: async (id: number, payload: Partial<CreateCategoryPayload>): Promise<AdminCategoryResource> => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/categories/${id}`);
  },
};
