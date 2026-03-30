import { axiosInstance } from '../axiosInstance';
import type { CategoryResource } from '../../types/api';

export const adminCategoryApi = {
  list: async (): Promise<CategoryResource[]> => {
    const response = await axiosInstance.get('/categories');
    return response.data.data ?? response.data;
  },
};
