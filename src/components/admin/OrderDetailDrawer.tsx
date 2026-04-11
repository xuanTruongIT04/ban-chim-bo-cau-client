import { Alert, Button, Divider, Drawer, Descriptions, Popconfirm, Select, Space, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useAdminOrder, useConfirmPayment, useSetDeliveryMethod } from '../../hooks/admin/useAdminOrders';
import OrderStatusButtons from './OrderStatusButtons';
import { formatVND } from '../../utils/format';
import type { OrderItemResource } from '../../types/api';

interface OrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

const itemColumns: ColumnsType<OrderItemResource> = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: 'SL',
    key: 'quantity',
    render: (_, record) => parseFloat(record.quantity),
    width: 70,
    align: 'right',
  },
  {
    title: 'Đơn giá',
    key: 'price_vnd',
    render: (_, record) => formatVND(record.price_vnd),
    width: 130,
    align: 'right',
  },
  {
    title: 'Thành tiền',
    key: 'subtotal_vnd',
    render: (_, record) => (
      <span style={{ fontWeight: 700, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
        {formatVND(record.subtotal_vnd)}
      </span>
    ),
    width: 130,
    align: 'right',
  },
];

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
function DrawerSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 50%, #f0f0f0 100%)',
    backgroundSize: '200% 100%',
    animation: 'drawer-shimmer 1.4s ease-in-out infinite',
    borderRadius: 6,
  } as const;
  return (
    <>
      <style>{`@keyframes drawer-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ ...shimmer, width: 100, height: 14, flexShrink: 0 }} />
            <div style={{ ...shimmer, flex: 1, height: 14 }} />
          </div>
        ))}
        <div style={{ ...shimmer, height: 1, width: '100%', marginTop: 4 }} />
        {[1, 2, 3].map((i) => (
          <div key={`row-${i}`} style={{ display: 'flex', gap: 10 }}>
            <div style={{ ...shimmer, flex: 4, height: 16 }} />
            <div style={{ ...shimmer, flex: 1, height: 16 }} />
            <div style={{ ...shimmer, flex: 1, height: 16 }} />
            <div style={{ ...shimmer, flex: 1, height: 16 }} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <div style={{ ...shimmer, width: 140, height: 18 }} />
        </div>
      </div>
    </>
  );
}

const DELIVERY_OPTIONS = [
  { value: 'noi_tinh', label: 'Nội tỉnh (tự giao)' },
  { value: 'ngoai_tinh', label: 'Ngoại tỉnh (xe khách)' },
];

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function OrderDetailDrawer({ orderId, onClose }: OrderDetailDrawerProps) {
  const { data: order, isLoading, isError } = useAdminOrder(orderId ?? 0);
  const confirmPayment = useConfirmPayment();
  const setDelivery = useSetDeliveryMethod();
  const { token: designToken } = theme.useToken();

  return (
    <Drawer
      open={!!orderId}
      onClose={onClose}
      width={560}
      title={orderId ? `Đơn hàng #${orderId}` : ''}
      destroyOnClose
    >
      {isLoading ? (
        <DrawerSkeleton />
      ) : isError ? (
        <Alert
          type="error"
          message="Không tải được chi tiết đơn hàng"
          description="Đã có lỗi xảy ra. Vui lòng đóng và mở lại."
          showIcon
        />
      ) : order ? (
        <>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Khách hàng">{order.customer_name}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{order.customer_phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{order.delivery_address}</Descriptions.Item>
            <Descriptions.Item label="Thanh toán">{order.payment_method_label}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng TT">
              <Space size={6}>
                <Tag color={order.payment_status === 'da_thanh_toan' ? 'success' : 'warning'}>
                  {order.payment_status_label}
                </Tag>
                {order.payment_method === 'chuyen_khoan' && order.payment_status !== 'da_thanh_toan' && (
                  <Popconfirm
                    title="Xác nhận thanh toán"
                    description="Xác nhận đã nhận được tiền chuyển khoản từ khách?"
                    okText="Đã nhận tiền"
                    cancelText="Hủy"
                    onConfirm={() => confirmPayment.mutate(order.id)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={confirmPayment.isPending}
                      style={{ fontSize: 12, height: 26 }}
                    >
                      Xác nhận TT
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức giao">
              <Select
                value={order.delivery_method ?? undefined}
                placeholder="Chọn hình thức giao"
                options={DELIVERY_OPTIONS}
                size="small"
                style={{ minWidth: 180 }}
                loading={setDelivery.isPending}
                onChange={(val) => setDelivery.mutate({ id: order.id, method: val })}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(order.created_at).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>

          <Table<OrderItemResource>
            size="small"
            pagination={false}
            dataSource={order.items}
            columns={itemColumns}
            rowKey="id"
            style={{ marginBottom: 16 }}
          />

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Typography.Text strong style={{ fontSize: 16 }}>
              Tổng:{' '}
              <span style={{ color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
                {formatVND(parseFloat(order.total_amount))}
              </span>
            </Typography.Text>
          </div>

          <Divider style={{ margin: '0 0 16px' }} />
          <Typography.Text strong style={{ fontSize: 13, color: designToken.colorTextSecondary, display: 'block', marginBottom: 10 }}>
            Cập nhật trạng thái đơn hàng
          </Typography.Text>
          <OrderStatusButtons orderId={order.id} currentStatus={order.order_status} />
        </>
      ) : null}
    </Drawer>
  );
}
