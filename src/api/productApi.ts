import { axiosInstance } from './axiosInstance';
import type {
  ProductListParams,
  PaginatedResponse,
  ProductResource,
  ProductDetailResource,
} from '../types/api';

export const productApi = {
  list: async (params: ProductListParams): Promise<PaginatedResponse<ProductResource>> => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },
  getById: async (id: number): Promise<ProductDetailResource> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data.data;
  },
};
