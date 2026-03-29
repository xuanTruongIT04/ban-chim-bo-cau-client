import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: id > 0,
    staleTime: 2 * 60 * 1000,
  });
}
