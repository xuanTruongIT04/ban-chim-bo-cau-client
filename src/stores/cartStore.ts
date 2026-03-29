import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartToken: string | null;
  setCartToken: (token: string) => void;
  clearCartToken: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartToken: null,
      setCartToken: (token) => set({ cartToken: token }),
      clearCartToken: () => set({ cartToken: null }),
    }),
    { name: 'cart_token_storage' },
  ),
);
