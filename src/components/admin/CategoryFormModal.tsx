import { useEffect } from 'react';
import { Form, Input, Modal, Select, Switch } from 'antd';
import { useAdminCategories, useCreateCategory, useUpdateCategory } from '../../hooks/admin/useAdminCategories';
import type { AdminCategoryResource, CreateCategoryPayload } from '../../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  editingCategory: AdminCategoryResource | null;
}

export default function CategoryFormModal({ open, onClose, editingCategory }: Props) {
  const [form] = Form.useForm();
  const isEdit = editingCategory !== null;

  const { data: categories } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isLoading = createCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          parent_id: editingCategory.parent_id,
          is_active: editingCategory.is_active,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [open, editingCategory, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields() as CreateCategoryPayload;
      if (isEdit && editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload: values });
      } else {
        await createCategory.mutateAsync(values);
      }
      onClose();
    } catch {
      // validation errors handled by AntD Form, mutation errors handled in hooks
    }
  };

  // Flatten categories, excluding current editing category to prevent self-reference
  const categoryOptions = (categories ?? [])
    .filter((cat) => !isEdit || cat.id !== editingCategory?.id)
    .map((cat) => ({ value: cat.id, label: cat.name }));

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa đầu mục' : 'Thêm đầu mục mới'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? 'Cập nhật' : 'Tạo'}
      cancelText="Hủy"
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên đầu mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên đầu mục' }]}
        >
          <Input placeholder="Nhập tên đầu mục" />
        </Form.Item>

        <Form.Item name="parent_id" label="Đầu mục cha">
          <Select
            options={categoryOptions}
            placeholder="Chọn đầu mục cha (tùy chọn)"
            allowClear
          />
        </Form.Item>

        <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
