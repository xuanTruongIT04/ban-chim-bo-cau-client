import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { App } from 'antd';
import { adminProductApi } from '../../api/admin/adminProductApi';
import type { CreateProductPayload, AdjustStockPayload } from '../../types/api';

export const ADMIN_PRODUCTS_KEY = 'admin-products';
export const ADMIN_PRODUCT_KEY = 'admin-product';

export function useAdminProducts(params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: [ADMIN_PRODUCTS_KEY, params],
    queryFn: () => adminProductApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminProduct(id: number) {
  return useQuery({
    queryKey: [ADMIN_PRODUCT_KEY, id],
    queryFn: () => adminProductApi.getById(id),
    enabled: id > 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => adminProductApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] });
      message.success('Tạo sản phẩm thành công');
    },
    onError: () => {
      message.error('Không thể tạo sản phẩm. Vui lòng thử lại.');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateProductPayload> }) =>
      adminProductApi.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, id] });
      message.success('Cập nhật sản phẩm thành công');
    },
    onError: () => {
      message.error('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: number) => adminProductApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] });
      message.success('Xóa sản phẩm thành công');
    },
    onError: () => {
      message.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
    },
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({
      productId,
      file,
      isPrimary,
    }: {
      productId: number;
      file: File;
      isPrimary?: boolean;
    }) => adminProductApi.uploadImage(productId, file, isPrimary),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, productId] });
      message.success('Tải ảnh lên thành công');
    },
    onError: () => {
      message.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      adminProductApi.deleteImage(productId, imageId),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, productId] });
      message.success('Xóa ảnh thành công');
    },
    onError: () => {
      message.error('Không thể xóa ảnh. Vui lòng thử lại.');
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: AdjustStockPayload;
    }) => adminProductApi.adjustStock(productId, payload),
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, productId] });
      message.success('Điều chỉnh tồn kho thành công');
    },
    onError: () => {
      message.error('Không thể điều chỉnh tồn kho. Vui lòng thử lại.');
    },
  });
}
