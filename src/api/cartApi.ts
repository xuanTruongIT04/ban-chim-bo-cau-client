import { axiosInstance } from './axiosInstance';
import type { CartData } from '../types/api';

export const cartApi = {
  create: async (): Promise<{ token: string; expires_at: string }> => {
    const response = await axiosInstance.post('/cart');
    return response.data.data;
  },
  get: async (): Promise<CartData> => {
    const response = await axiosInstance.get('/cart');
    return response.data.data;
  },
  addItem: async (productId: number, quantity: number): Promise<CartData> => {
    const response = await axiosInstance.post('/cart/items', { product_id: productId, quantity });
    return response.data.data;
  },
  updateItem: async (itemId: number, quantity: number): Promise<CartData> => {
    const response = await axiosInstance.patch(`/cart/items/${itemId}`, { quantity });
    return response.data.data;
  },
  removeItem: async (itemId: number): Promise<void> => {
    await axiosInstance.delete(`/cart/items/${itemId}`);
  },
};
