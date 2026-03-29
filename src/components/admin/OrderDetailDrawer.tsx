import { Drawer, Descriptions, Table, Spin, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAdminOrder } from '../../hooks/admin/useAdminOrders';
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
    render: (_, record) => {
      const qty = parseFloat(record.quantity);
      return Number.isInteger(qty) ? qty : qty;
    },
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
    render: (_, record) => formatVND(record.subtotal_vnd),
    width: 130,
    align: 'right',
  },
];

export default function OrderDetailDrawer({
  orderId,
  onClose,
}: OrderDetailDrawerProps) {
  const { data: order, isLoading } = useAdminOrder(orderId ?? 0);

  return (
    <Drawer
      open={!!orderId}
      onClose={onClose}
      width={560}
      title={orderId ? `Đơn hàng #${orderId}` : ''}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : order ? (
        <>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Khách hàng">
              {order.customer_name}
            </Descriptions.Item>
            <Descriptions.Item label="SĐT">
              {order.customer_phone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {order.delivery_address}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              {order.payment_method_label}
            </Descriptions.Item>
            <Descriptions.Item label="Tình trạng TT">
              {order.payment_status_label}
            </Descriptions.Item>
            <Descriptions.Item label="Giao hàng">
              {order.delivery_method_label ?? 'Chưa xác định'}
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

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Typography.Text strong>
              Tổng: {formatVND(parseFloat(order.total_amount))}
            </Typography.Text>
          </div>

          <OrderStatusButtons
            orderId={order.id}
            currentStatus={order.order_status}
          />
        </>
      ) : null}
    </Drawer>
  );
}
