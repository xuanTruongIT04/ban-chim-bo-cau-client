import { axiosInstance } from './axiosInstance';
import type { CheckoutPayload, CheckoutResponse } from '../types/api';

export const checkoutApi = {
  submit: async (payload: CheckoutPayload, idempotencyKey: string): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post('/checkout', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return {
      order: response.data.data,
      bank_info: response.data.bank_info,
    };
  },
};
