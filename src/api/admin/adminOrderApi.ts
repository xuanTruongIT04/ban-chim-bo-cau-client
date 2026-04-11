import { axiosInstance } from '../axiosInstance';
import type {
  PaginatedResponse,
  OrderResource,
  AdminOrderListParams,
} from '../../types/api';

export const adminOrderApi = {
  list: async (params: AdminOrderListParams): Promise<PaginatedResponse<OrderResource>> => {
    const response = await axiosInstance.get('/admin/orders', { params });
    return response.data;
  },

  getById: async (id: number): Promise<OrderResource> => {
    const response = await axiosInstance.get(`/admin/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: number, status: string): Promise<OrderResource> => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Cancel an order.
   * CRITICAL: Uses POST /admin/orders/{id}/cancel — NOT PATCH /status with 'huy'.
   * These are separate endpoints per the openapi spec.
   */
  cancel: async (id: number): Promise<OrderResource> => {
    const response = await axiosInstance.post(`/admin/orders/${id}/cancel`);
    return response.data.data;
  },

  confirmPayment: async (id: number): Promise<OrderResource> => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/payment-status`);
    return response.data.data;
  },

  setDeliveryMethod: async (id: number, delivery_method: string): Promise<OrderResource> => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/delivery-method`, { delivery_method });
    return response.data.data;
  },
};
