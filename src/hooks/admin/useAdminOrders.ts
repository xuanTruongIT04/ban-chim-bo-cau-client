import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { App } from 'antd';
import { adminOrderApi } from '../../api/admin/adminOrderApi';
import type { AdminOrderListParams } from '../../types/api';

export const ADMIN_ORDERS_KEY = 'admin-orders';
export const ADMIN_ORDER_KEY = 'admin-order';

export function useAdminOrders(params: AdminOrderListParams = {}) {
  return useQuery({
    queryKey: [ADMIN_ORDERS_KEY, params],
    queryFn: () => adminOrderApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: [ADMIN_ORDER_KEY, id],
    queryFn: () => adminOrderApi.getById(id),
    enabled: id > 0,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminOrderApi.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDER_KEY, id] });
      message.success('Cập nhật trạng thái đơn hàng thành công');
    },
    onError: () => {
      message.error('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    },
  });
}

/**
 * Fetches all completed orders and returns the total revenue sum.
 * DASH-02: Backend dashboard endpoint lacks revenue data — calculated client-side.
 */
export function useCompletedOrdersRevenue() {
  return useQuery({
    queryKey: [ADMIN_ORDERS_KEY, { 'filter[status]': 'hoan_thanh', per_page: 9999 }],
    queryFn: () => adminOrderApi.list({ 'filter[status]': 'hoan_thanh', per_page: 9999 }),
    select: (data) =>
      data.data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => adminOrderApi.confirmPayment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDER_KEY, id] });
      message.success('Đã xác nhận thanh toán');
    },
    onError: () => {
      message.error('Không thể xác nhận thanh toán. Vui lòng thử lại.');
    },
  });
}

export function useSetDeliveryMethod() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, method }: { id: number; method: string }) =>
      adminOrderApi.setDeliveryMethod(id, method),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDER_KEY, id] });
      message.success('Đã cập nhật hình thức giao hàng');
    },
    onError: () => {
      message.error('Không thể cập nhật hình thức giao. Vui lòng thử lại.');
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => adminOrderApi.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_ORDER_KEY, id] });
      message.success('Hủy đơn hàng thành công');
    },
    onError: () => {
      message.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
    },
  });
}
