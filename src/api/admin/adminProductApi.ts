import { axiosInstance } from '../axiosInstance';
import type {
  PaginatedResponse,
  ProductResource,
  AdminProductDetailResource,
  CreateProductPayload,
  ProductImageResource,
  StockAdjustmentResource,
  AdjustStockPayload,
} from '../../types/api';

export const adminProductApi = {
  list: async (params: { page?: number; per_page?: number }): Promise<PaginatedResponse<ProductResource>> => {
    const response = await axiosInstance.get('/admin/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<AdminProductDetailResource> => {
    const response = await axiosInstance.get(`/admin/products/${id}`);
    return response.data.data;
  },

  create: async (payload: CreateProductPayload): Promise<AdminProductDetailResource> => {
    const response = await axiosInstance.post('/admin/products', payload);
    return response.data.data;
  },

  update: async (id: number, payload: Partial<CreateProductPayload>): Promise<AdminProductDetailResource> => {
    const response = await axiosInstance.put(`/admin/products/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/products/${id}`);
  },

  toggleActive: async (id: number): Promise<ProductResource> => {
    const response = await axiosInstance.patch(`/admin/products/${id}/toggle-active`);
    return response.data.data;
  },

  /**
   * Upload an image for a product.
   * CRITICAL: Do NOT set Content-Type header manually — let axios auto-detect FormData
   * and set multipart/form-data with the correct boundary.
   */
  uploadImage: async (productId: number, file: File, isPrimary?: boolean): Promise<ProductImageResource> => {
    const formData = new FormData();
    formData.append('image', file);
    if (isPrimary) {
      formData.append('is_primary', '1');
    }
    const response = await axiosInstance.post(`/admin/products/${productId}/images`, formData);
    return response.data.data;
  },

  setPrimaryImage: async (productId: number, imageId: number): Promise<ProductImageResource> => {
    const response = await axiosInstance.patch(`/admin/products/${productId}/images/${imageId}/primary`);
    return response.data.data;
  },

  deleteImage: async (productId: number, imageId: number): Promise<void> => {
    await axiosInstance.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  getStockAdjustments: async (
    productId: number,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<StockAdjustmentResource>> => {
    const response = await axiosInstance.get(`/admin/products/${productId}/stock-adjustments`, { params });
    return response.data;
  },

  adjustStock: async (productId: number, payload: AdjustStockPayload): Promise<StockAdjustmentResource> => {
    const response = await axiosInstance.post(`/admin/products/${productId}/stock-adjustments`, payload);
    return response.data.data;
  },
};
