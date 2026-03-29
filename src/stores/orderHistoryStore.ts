import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderResource } from '../types/api';

const MAX_ORDERS = 20;

interface OrderHistoryState {
  orders: OrderResource[];
  addOrder: (order: OrderResource) => void;
  clearHistory: () => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => {
          // Deduplicate by id, prepend new order, keep max 20
          const filtered = state.orders.filter((o) => o.id !== order.id);
          return { orders: [order, ...filtered].slice(0, MAX_ORDERS) };
        }),
      clearHistory: () => set({ orders: [] }),
    }),
    {
      name: 'order-history',
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);
