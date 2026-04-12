import { Alert, Button, Divider, Drawer, Descriptions, Grid, Popconfirm, Select, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAdminOrder, useConfirmPayment, useSetDeliveryMethod } from '../../hooks/admin/useAdminOrders';
import OrderStatusButtons from './OrderStatusButtons';
import { formatVND } from '../../utils/format';
import type { OrderItemResource } from '../../types/api';

const { useBreakpoint } = Grid;

interface OrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

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
          </div>
        ))}
      </div>
    </>
  );
}

const DELIVERY_OPTIONS = [
  { value: 'noi_tinh',   label: 'Nội tỉnh (tự giao)' },
  { value: 'ngoai_tinh', label: 'Ngoại tỉnh (xe khách)' },
];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${date} lúc ${time}`;
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export default function OrderDetailDrawer({ orderId, onClose }: OrderDetailDrawerProps) {
  const { data: order, isLoading, isError } = useAdminOrder(orderId ?? 0);
  const confirmPayment = useConfirmPayment();
  const setDelivery    = useSetDeliveryMethod();
  const { token: designToken } = theme.useToken();
  const screens  = useBreakpoint();
  const isMobile = !screens.md;

  const itemColumns: ColumnsType<OrderItemResource> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: true,
    },
    {
      title: 'SL',
      key: 'quantity',
      render: (_, record) => parseFloat(record.quantity),
      width: 50,
      align: 'right',
    },
    ...(!isMobile ? [{
      title: 'Đơn giá',
      key: 'price_vnd',
      render: (_: unknown, record: OrderItemResource) => formatVND(record.price_vnd),
      width: 110,
      align: 'right' as const,
    }] : []),
    {
      title: 'Thành tiền',
      key: 'subtotal_vnd',
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          {formatVND(record.subtotal_vnd)}
        </span>
      ),
      width: isMobile ? 100 : 120,
      align: 'right',
    },
  ];

  const drawerWidth = isMobile ? '100vw' : 560;

  return (
    <Drawer
      open={!!orderId}
      onClose={onClose}
      width={drawerWidth}
      title={orderId ? `Đơn hàng #${orderId}` : ''}
      destroyOnHidden
      styles={{
        body:   { padding: isMobile ? '12px 16px 24px' : '24px' },
        header: { padding: isMobile ? '12px 16px' : '16px 24px' },
      }}
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
          {/* ── [PHẦN 1] Xác nhận thanh toán — ưu tiên cao, hiện ngay đầu ── */}
          {order.payment_status !== 'da_thanh_toan' && order.order_status !== 'huy' && (
            <Popconfirm
              title="Xác nhận thanh toán"
              description="Xác nhận khách đã thanh toán (qua điện thoại / khi nhận hàng)?"
              okText="Đã nhận tiền"
              cancelText="Hủy"
              onConfirm={() => confirmPayment.mutate(order.id)}
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={confirmPayment.isPending}
                block
                style={{
                  marginBottom: 16,
                  background: '#2e7d32',
                  borderColor: '#2e7d32',
                  height: 52,
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                Xác nhận đã nhận tiền
              </Button>
            </Popconfirm>
          )}

          {/* ── [PHẦN 2] Cập nhật trạng thái đơn — NGAY ĐẦU để dễ thao tác ── */}
          {order.order_status !== 'hoan_thanh' && order.order_status !== 'huy' && (
            <div
              style={{
                background: designToken.colorBgLayout,
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16,
                border: `1px solid ${designToken.colorBorderSecondary}`,
              }}
            >
              <OrderStatusButtons orderId={order.id} currentStatus={order.order_status} />
            </div>
          )}

          {/* ── [PHẦN 3] Thông tin khách hàng ── */}
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Khách hàng">
              <span style={{ fontWeight: 600, fontSize: 15 }}>{order.customer_name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="SĐT">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{order.customer_phone}</span>
                <Button
                  type="primary"
                  icon={<PhoneOutlined />}
                  href={`tel:${order.customer_phone}`}
                  style={{ height: 44, fontSize: 14, background: '#1565c0', fontWeight: 700 }}
                >
                  Gọi ngay
                </Button>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{order.delivery_address}</Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Tag color={order.payment_status === 'da_thanh_toan' ? 'success' : 'warning'} style={{ fontWeight: 600 }}>
                {order.payment_status_label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức giao">
              <Select
                value={order.delivery_method ?? undefined}
                placeholder="Chọn hình thức"
                options={DELIVERY_OPTIONS}
                size={isMobile ? 'middle' : 'small'}
                style={{ width: isMobile ? '100%' : undefined, minWidth: 160 }}
                loading={setDelivery.isPending}
                onChange={(val) => setDelivery.mutate({ id: order.id, method: val })}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              <span style={{ fontSize: 13 }}>{formatDateTime(order.created_at)}</span>
            </Descriptions.Item>
          </Descriptions>

          {/* ── [PHẦN 4] Danh sách sản phẩm ── */}
          <Table<OrderItemResource>
            size="small"
            pagination={false}
            dataSource={order.items}
            columns={itemColumns}
            rowKey="id"
            style={{ marginBottom: 12 }}
            scroll={isMobile ? { x: 280 } : undefined}
          />

          <div
            style={{
              textAlign: 'right',
              marginBottom: 16,
              padding: '12px 16px',
              background: '#fff8e1',
              borderRadius: 8,
            }}
          >
            <Typography.Text strong style={{ fontSize: isMobile ? 20 : 17 }}>
              Tổng:{' '}
              <span style={{ color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
                {formatVND(parseFloat(order.total_amount))}
              </span>
            </Typography.Text>
          </div>

          {/* ── Trạng thái terminal — chỉ hiện label ── */}
          {(order.order_status === 'hoan_thanh' || order.order_status === 'huy') && (
            <>
              <Divider style={{ margin: '0 0 12px' }} />
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Tag
                  color={order.order_status === 'hoan_thanh' ? 'green' : 'red'}
                  style={{ fontSize: 15, padding: '6px 20px', fontWeight: 700 }}
                >
                  {order.order_status === 'hoan_thanh' ? 'Đơn hàng đã hoàn thành' : 'Đơn hàng đã hủy'}
                </Tag>
              </div>
            </>
          )}
        </>
      ) : null}
    </Drawer>
  );
}
