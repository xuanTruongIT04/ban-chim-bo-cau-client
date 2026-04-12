import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { cartApi } from '../api/cartApi';
import { useCartStore } from '../stores/cartStore';
import type { CartData } from '../types/api';

async function ensureCartToken(): Promise<string> {
  const store = useCartStore.getState();
  if (store.cartToken) return store.cartToken;
  const { token } = await cartApi.create();
  store.setCartToken(token);
  return token;
}

async function handleCartError(error: unknown, retry: () => Promise<unknown>) {
  const axiosError = error as { response?: { status?: number; data?: { code?: string } } };
  const code = axiosError.response?.data?.code;
  if (code === 'CART_NOT_FOUND' || code === 'CART_TOKEN_REQUIRED') {
    useCartStore.getState().clearCartToken();
    const { token } = await cartApi.create();
    useCartStore.getState().setCartToken(token);
    return retry();
  }
  throw error;
}

export function useCart() {
  const cartToken = useCartStore((s) => s.cartToken);

  return useQuery({
    queryKey: ['cart', cartToken],
    queryFn: async () => {
      if (!cartToken) return null;
      try {
        return await cartApi.get();
      } catch (error) {
        return handleCartError(error, () => cartApi.get()) as Promise<CartData>;
      }
    },
    enabled: !!cartToken,
    staleTime: 30 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await ensureCartToken();
      try {
        return await cartApi.addItem(productId, quantity);
      } catch (error) {
        return handleCartError(error, () => cartApi.addItem(productId, quantity)) as Promise<CartData>;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Thông báo thành công do ProductCard xử lý qua SuccessModal — không toast ở đây
    },
    onError: () => {
      message.error('Không thêm được vào giỏ hàng. Vui lòng thử lại.');
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return cartApi.updateItem(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      await cartApi.removeItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
