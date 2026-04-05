import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderResource } from '../types/api';

const MAX_ORDERS = 50;

interface OrderHistoryState {
  orders: OrderResource[];
  addOrder: (order: OrderResource) => void;
  updateOrder: (order: OrderResource) => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => {
          const filtered = state.orders.filter((o) => o.id !== order.id);
          return { orders: [order, ...filtered].slice(0, MAX_ORDERS) };
        }),
      updateOrder: (order) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === order.id ? order : o)),
        })),
    }),
    {
      name: 'order-history',
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);
