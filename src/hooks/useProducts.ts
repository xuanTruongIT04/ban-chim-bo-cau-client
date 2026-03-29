import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import type { ProductListParams } from '../types/api';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}
