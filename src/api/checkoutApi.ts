import { axiosInstance } from './axiosInstance';
import type { CheckoutPayload, OrderResource } from '../types/api';

export const checkoutApi = {
  submit: async (payload: CheckoutPayload, idempotencyKey: string): Promise<OrderResource> => {
    const response = await axiosInstance.post('/checkout', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return response.data.data;
  },
};
