import { Button, Flex, Modal, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CarOutlined,
  TrophyOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useUpdateOrderStatus, useCancelOrder } from '../../hooks/admin/useAdminOrders';

interface OrderStatusButtonsProps {
  orderId: number;
  currentStatus: string;
}

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  cho_xac_nhan: { label: 'Chờ xác nhận', color: 'orange',   icon: <ClockCircleOutlined /> },
  xac_nhan:     { label: 'Đã xác nhận',  color: 'blue',     icon: <CheckCircleOutlined /> },
  dang_giao:    { label: 'Đang giao',    color: 'geekblue', icon: <CarOutlined /> },
  hoan_thanh:   { label: 'Hoàn thành',  color: 'green',    icon: <TrophyOutlined /> },
  huy:          { label: 'Đã hủy',      color: 'red',      icon: <CloseCircleOutlined /> },
};

/* Các bước chuyển trạng thái hợp lệ */
const FORWARD_TRANSITIONS: Record<
  string,
  { status: string; label: string; icon: React.ReactNode; variant: 'primary' | 'back' }[]
> = {
  cho_xac_nhan: [
    { status: 'xac_nhan', label: 'Xác nhận đơn', icon: <CheckCircleOutlined />, variant: 'primary' },
  ],
  xac_nhan: [
    { status: 'dang_giao',    label: 'Bắt đầu giao',  icon: <CarOutlined />,       variant: 'primary' },
    { status: 'cho_xac_nhan', label: 'Hoàn trả chờ',  icon: <RollbackOutlined />,  variant: 'back' },
  ],
  dang_giao: [
    { status: 'hoan_thanh', label: 'Đã giao xong',     icon: <TrophyOutlined />,    variant: 'primary' },
    { status: 'xac_nhan',   label: 'Hoàn trả xác nhận', icon: <RollbackOutlined />, variant: 'back' },
  ],
  hoan_thanh: [],
  huy:        [],
};

const CAN_CANCEL = ['cho_xac_nhan', 'xac_nhan', 'dang_giao'];

const BTN_HEIGHT = 48; // đảm bảo 44px+ touch target

export default function OrderStatusButtons({ orderId, currentStatus }: OrderStatusButtonsProps) {
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder  = useCancelOrder();

  const transitions = FORWARD_TRANSITIONS[currentStatus] ?? [];
  const canCancel    = CAN_CANCEL.includes(currentStatus);

  if (transitions.length === 0 && !canCancel) return null;

  const isPending = updateStatus.isPending || cancelOrder.isPending;

  const handleCancel = () => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc muốn hủy đơn hàng này không? Hàng sẽ được hoàn lại kho. Không thể hoàn tác.',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: () => cancelOrder.mutate(orderId),
    });
  };

  /* ── Hiển thị trạng thái hiện tại ── */
  const currentMeta = STATUS_META[currentStatus];

  return (
    <div>
      {/* Chip trạng thái hiện tại */}
      {currentMeta && (
        <div style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            Trạng thái hiện tại
          </Typography.Text>
          <Tag
            color={currentMeta.color}
            icon={currentMeta.icon}
            style={{ fontSize: 14, padding: '4px 12px', fontWeight: 700 }}
          >
            {currentMeta.label}
          </Tag>
        </div>
      )}

      {/* Các nút chuyển trạng thái */}
      <Flex gap={10} wrap="wrap">
        {transitions.map((t) =>
          t.variant === 'primary' ? (
            <Button
              key={t.status}
              type="primary"
              icon={t.icon}
              loading={isPending}
              onClick={() => updateStatus.mutate({ id: orderId, status: t.status })}
              style={{ height: BTN_HEIGHT, fontWeight: 700, fontSize: 15, flex: 1, minWidth: 140 }}
            >
              {t.label}
            </Button>
          ) : (
            <Button
              key={t.status}
              icon={t.icon}
              loading={isPending}
              onClick={() => updateStatus.mutate({ id: orderId, status: t.status })}
              style={{ height: BTN_HEIGHT, fontSize: 14, color: '#595959', flex: '0 0 auto' }}
            >
              {t.label}
            </Button>
          )
        )}

        {canCancel && (
          <Button
            danger
            icon={<CloseCircleOutlined />}
            loading={isPending}
            onClick={handleCancel}
            style={{ height: BTN_HEIGHT, fontSize: 14, flex: '0 0 auto' }}
          >
            Hủy đơn
          </Button>
        )}
      </Flex>
    </div>
  );
}
