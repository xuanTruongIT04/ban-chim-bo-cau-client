import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Table,
  Tag,
  Button,
  Empty,
  Descriptions,
  Modal,
  Drawer,
  Card,
  Grid,
  Divider,
} from 'antd';
import { PhoneOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';
import { formatVND } from '../../utils/format';
import type { OrderResource, OrderItemResource } from '../../types/api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ORDER_STATUS_COLORS: Record<string, string> = {
  cho_xac_nhan: 'orange',
  xac_nhan: 'blue',
  dang_giao: 'geekblue',
  hoan_thanh: 'green',
  huy: 'red',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  huy: 'Người bán hàng huỷ',
};

function statusLabel(order: OrderResource) {
  return ORDER_STATUS_LABELS[order.order_status] ?? order.order_status_label;
}

function statusColor(status: string) {
  return ORDER_STATUS_COLORS[status] ?? 'default';
}

/* ─── Mobile Order Card ─────────────────────────────────────────────────────── */
function OrderCard({ order, onDetail }: { order: OrderResource; onDetail: () => void }) {
  return (
    <Card
      size="small"
      style={{ marginBottom: 10, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      styles={{ body: { padding: '12px 14px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <Text strong style={{ fontSize: 15, color: '#1565c0' }}>Đơn #{order.id}</Text>
        <Tag color={statusColor(order.order_status)} style={{ margin: 0, fontWeight: 600 }}>
          {statusLabel(order)}
        </Tag>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#757575', fontSize: 13, marginBottom: 8 }}>
        <ClockCircleOutlined style={{ fontSize: 12 }} />
        <span>{new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 16, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          {formatVND(parseFloat(order.total_amount))}
        </Text>
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={onDetail}
          style={{ borderColor: '#1565c0', color: '#1565c0', fontWeight: 600 }}
        >
          Chi tiết
        </Button>
      </div>
    </Card>
  );
}

/* ─── Order Detail Content ───────────────────────────────────────────────────── */
function OrderDetailContent({ order }: { order: OrderResource }) {
  return (
    <>
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColor(order.order_status)} style={{ fontWeight: 600 }}>
            {statusLabel(order)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách">{order.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.customer_phone}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao">{order.delivery_address}</Descriptions.Item>
        <Descriptions.Item label="Thanh toán">{order.payment_status_label}</Descriptions.Item>
      </Descriptions>

      <Text strong style={{ display: 'block', marginBottom: 8, color: '#555' }}>Sản phẩm</Text>
      {order.items.map((item: OrderItemResource) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0',
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ display: 'block', fontWeight: 500, wordBreak: 'break-word' }}>{item.product_name}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {formatVND(item.price_vnd)} × {parseFloat(item.quantity)}
            </Text>
          </div>
          <Text strong style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: '#d4880a' }}>
            {formatVND(item.subtotal_vnd)}
          </Text>
        </div>
      ))}

      <Divider style={{ margin: '12px 0 8px' }} />
      <div style={{ textAlign: 'right' }}>
        <Text strong style={{ fontSize: 17, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          Tổng: {formatVND(parseFloat(order.total_amount))}
        </Text>
      </div>
    </>
  );
}

/* ─── Desktop columns ────────────────────────────────────────────────────────── */
function buildColumns(onDetail: (o: OrderResource) => void): ColumnsType<OrderResource> {
  return [
    {
      title: 'Mã đơn', dataIndex: 'id', key: 'id',
      render: (id: number) => <Text strong style={{ color: '#1565c0' }}>{`#${id}`}</Text>,
      width: 90,
    },
    {
      title: 'Ngày đặt', dataIndex: 'created_at', key: 'created_at',
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      width: 120,
    },
    {
      title: 'Trạng thái', dataIndex: 'order_status', key: 'order_status',
      render: (status: string, record: OrderResource) => (
        <Tag color={statusColor(status)}>{statusLabel(record)}</Tag>
      ),
      width: 160,
    },
    {
      title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount',
      render: (amount: string) => (
        <Text strong style={{ color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          {formatVND(parseFloat(amount))}
        </Text>
      ),
      width: 150,
    },
    {
      title: '', key: 'action', width: 110, align: 'center',
      render: (_: unknown, record: OrderResource) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function MyOrdersPage() {
  const orders = useOrderHistoryStore((s) => s.orders);
  const [selectedOrder, setSelectedOrder] = useState<OrderResource | null>(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 16px' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>Đơn hàng của tôi</Title>
        <a href="tel:0978238946">
          <Button
            icon={<PhoneOutlined />}
            size={isMobile ? 'small' : 'middle'}
            style={{ fontWeight: 600 }}
          >
            {isMobile ? 'Gọi hỏi' : '0978 238 946'}
          </Button>
        </a>
      </div>
      {/* Hướng dẫn check trạng thái — guest không có API để cập nhật real-time */}
      {orders.length > 0 && (
        <div style={{
          background: '#e8f0fe', border: '1px solid #bbdefb',
          borderRadius: 8, padding: '8px 14px', marginBottom: 14,
          fontSize: 13, color: '#1565c0',
        }}>
          Để kiểm tra trạng thái mới nhất, vui lòng gọi <strong>0978 238 946</strong> — nhân viên sẽ cập nhật ngay.
        </div>
      )}

      {/* ── Empty state ── */}
      {orders.length === 0 ? (
        <Empty description="Bạn chưa có đơn hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Link to="/"><Button type="primary">Mua sắm ngay</Button></Link>
        </Empty>
      ) : isMobile ? (
        /* ── Mobile: Card list ── */
        <div>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDetail={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      ) : (
        /* ── Desktop: Table ── */
        <Table<OrderResource>
          dataSource={orders}
          columns={buildColumns(setSelectedOrder)}
          rowKey="id"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
        />
      )}

      {/* ── Mobile: Drawer ── */}
      {isMobile && (
        <Drawer
          open={selectedOrder !== null}
          onClose={() => setSelectedOrder(null)}
          placement="bottom"
          height="90vh"
          title={selectedOrder ? `Đơn hàng #${selectedOrder.id}` : ''}
          styles={{
            body: { padding: '16px' },
            header: { paddingInline: 16 },
          }}
        >
          {selectedOrder && <OrderDetailContent order={selectedOrder} />}
        </Drawer>
      )}

      {/* ── Desktop: Modal ── */}
      {!isMobile && (
        <Modal
          open={selectedOrder !== null}
          onCancel={() => setSelectedOrder(null)}
          footer={<Button onClick={() => setSelectedOrder(null)}>Đóng</Button>}
          title={selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.id}` : ''}
          width={640}
        >
          {selectedOrder && <OrderDetailContent order={selectedOrder} />}
        </Modal>
      )}
    </div>
  );
}
