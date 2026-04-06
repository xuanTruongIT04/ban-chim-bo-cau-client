import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adminCategoryApi } from '../../api/admin/adminCategoryApi';
import type { CreateCategoryPayload } from '../../types/api';

export const ADMIN_CATEGORIES_KEY = 'admin-categories';

export function useAdminCategories() {
  return useQuery({
    queryKey: [ADMIN_CATEGORIES_KEY],
    queryFn: () => adminCategoryApi.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => adminCategoryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_KEY] });
      message.success('Tạo đầu mục thành công');
    },
    onError: () => {
      message.error('Không thể tạo đầu mục. Vui lòng thử lại.');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateCategoryPayload> }) =>
      adminCategoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_KEY] });
      message.success('Cập nhật đầu mục thành công');
    },
    onError: () => {
      message.error('Không thể cập nhật đầu mục. Vui lòng thử lại.');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminCategoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_KEY] });
      message.success('Xóa đầu mục thành công');
    },
    onError: () => {
      message.error('Không thể xóa đầu mục. Vui lòng thử lại.');
    },
  });
}
