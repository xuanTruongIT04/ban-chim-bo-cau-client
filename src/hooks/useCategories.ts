import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import type { CategoryResource } from '../types/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryResource[]> => {
      const response = await axiosInstance.get('/categories');
      return response.data.data ?? response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
