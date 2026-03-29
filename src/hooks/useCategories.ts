import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import type { CategoryResource } from '../types/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryResource[]> => {
      // Backend only has GET /admin/categories (requires auth).
      // Attempt fetch — if 401 (guest), return empty array (graceful degradation).
      try {
        const response = await axiosInstance.get('/admin/categories');
        return response.data.data ?? response.data;
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}
