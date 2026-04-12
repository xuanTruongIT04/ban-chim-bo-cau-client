import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { adminCategoryApi } from '../../api/admin/adminCategoryApi';
import { useCreateProduct, useUpdateProduct } from '../../hooks/admin/useAdminProducts';
import type { CategoryResource, ProductResource } from '../../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  editingProduct: ProductResource | null;
}

function flattenCategories(categories: CategoryResource[]): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = [];
  for (const cat of categories) {
    result.push({ value: cat.id, label: cat.name });
    if (cat.children) {
      for (const child of cat.children) {
        result.push({ value: child.id, label: `\u00a0\u00a0${child.name}` });
      }
    }
  }
  return result;
}

export default function ProductFormModal({ open, onClose, editingProduct }: Props) {
  const [form] = Form.useForm();
  const isEdit = editingProduct !== null;

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminCategoryApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isLoading = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        form.setFieldsValue({
          name: editingProduct.name,
          price_vnd: editingProduct.price_vnd,
          unit_type: editingProduct.unit_type,
          category_id: editingProduct.category_id,
          stock_quantity: parseFloat(editingProduct.stock_quantity),
          is_active: editingProduct.is_active,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [open, editingProduct, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, payload: values });
      } else {
        await createProduct.mutateAsync({
          ...values,
          stock_quantity: values.stock_quantity != null ? String(values.stock_quantity) : undefined,
        });
      }
      onClose();
    } catch {
      // validation errors handled by AntD Form, mutation errors handled in hooks
    }
  };

  const categoryOptions = flattenCategories(categories ?? []);

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
      cancelText="Hủy"
      confirmLoading={isLoading}
      destroyOnHidden
      style={{ top: 20 }}
      styles={{ body: { padding: '16px 24px' } }}
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[
            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
            { min: 3, message: 'Tên sản phẩm tối thiểu 3 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả sản phẩm (tuỳ chọn)" />
        </Form.Item>

        <Form.Item
          name="price_vnd"
          label="Giá bán (VND)"
          rules={[
            { required: true, message: 'Vui lòng nhập giá sản phẩm' },
            { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' },
          ]}
        >
          <InputNumber<number>
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
            placeholder="Ví dụ: 150000"
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="unit_type"
          label="Đơn vị tính"
          rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
        >
          <Select
            options={[
              { value: 'con', label: 'Con (từng con)' },
              { value: 'kg',  label: 'Kg (theo cân)' },
            ]}
            placeholder="Chọn đơn vị"
          />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select options={categoryOptions} placeholder="Chọn danh mục" />
        </Form.Item>

        {!isEdit && (
          <Form.Item name="stock_quantity" label="Số lượng ban đầu">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số lượng (tuỳ chọn)" />
          </Form.Item>
        )}

        <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
