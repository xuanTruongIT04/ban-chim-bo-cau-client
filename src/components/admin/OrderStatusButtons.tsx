import { Button, Modal, Space } from 'antd';
import { useUpdateOrderStatus, useCancelOrder } from '../../hooks/admin/useAdminOrders';

interface OrderStatusButtonsProps {
  orderId: number;
  currentStatus: string;
}

const FORWARD_TRANSITIONS: Record<
  string,
  { status: string; label: string; type: 'primary' | 'default' }[]
> = {
  cho_xac_nhan: [{ status: 'xac_nhan', label: 'Xác nhận đơn', type: 'primary' }],
  xac_nhan: [
    { status: 'dang_giao', label: 'Bắt đầu giao', type: 'primary' },
    { status: 'cho_xac_nhan', label: 'Trả về chờ', type: 'default' },
  ],
  dang_giao: [
    { status: 'hoan_thanh', label: 'Hoàn thành', type: 'primary' },
    { status: 'xac_nhan', label: 'Trả về xác nhận', type: 'default' },
  ],
  hoan_thanh: [],
  huy: [],
};

const CAN_CANCEL = ['cho_xac_nhan', 'xac_nhan', 'dang_giao'];

export default function OrderStatusButtons({
  orderId,
  currentStatus,
}: OrderStatusButtonsProps) {
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();

  const transitions = FORWARD_TRANSITIONS[currentStatus] ?? [];
  const canCancel = CAN_CANCEL.includes(currentStatus);

  // Terminal statuses — no buttons
  if (transitions.length === 0 && !canCancel) {
    return null;
  }

  const isPending = updateStatus.isPending || cancelOrder.isPending;

  const handleCancel = () => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: () => {
        cancelOrder.mutate(orderId);
      },
    });
  };

  return (
    <Space wrap>
      {transitions.map((t) => (
        <Button
          key={t.status}
          type={t.type}
          loading={isPending}
          onClick={() => updateStatus.mutate({ id: orderId, status: t.status })}
        >
          {t.label}
        </Button>
      ))}
      {canCancel && (
        <Button
          danger
          loading={isPending}
          onClick={handleCancel}
        >
          Hủy đơn
        </Button>
      )}
    </Space>
  );
}
