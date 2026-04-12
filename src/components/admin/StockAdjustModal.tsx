import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useAdjustStock } from '../../hooks/admin/useAdminProducts';

interface Props {
  productId: number | null;
  open: boolean;
  onClose: () => void;
}

const ADJUSTMENT_TYPE_OPTIONS = [
  { value: 'nhap_hang', label: 'Nhập hàng' },
  { value: 'kiem_ke', label: 'Kiểm kê' },
  { value: 'hu_hong', label: 'Hư hỏng' },
  { value: 'khac', label: 'Khác' },
];

export default function StockAdjustModal({ productId, open, onClose }: Props) {
  const [form] = Form.useForm();
  const adjustStock = useAdjustStock();

  const handleSubmit = async () => {
    try {
      if (productId == null) return;
      const values = await form.validateFields();
      await adjustStock.mutateAsync({ productId, payload: values });
      form.resetFields();
      onClose();
    } catch {
      // validation errors handled by AntD Form
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Điều chỉnh tồn kho"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={adjustStock.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="delta"
          label="Số lượng thay đổi"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng thay đổi' },
            { type: 'number', message: 'Vui lòng nhập số hợp lệ' },
          ]}
          extra="Số dương để thêm, số âm để trừ kho"
        >
          <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 10 hoặc -5" />
        </Form.Item>

        <Form.Item
          name="adjustment_type"
          label="Loại điều chỉnh"
          rules={[{ required: true, message: 'Vui lòng chọn loại điều chỉnh' }]}
        >
          <Select options={ADJUSTMENT_TYPE_OPTIONS} placeholder="Chọn loại" />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú (tuỳ chọn)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
