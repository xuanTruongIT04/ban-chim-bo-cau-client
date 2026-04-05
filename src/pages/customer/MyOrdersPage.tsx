import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Table,
  Tag,
  Button,
  Empty,
  Descriptions,
  Spin,
  Modal,
} from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';
import { adminOrderApi } from '../../api/admin/adminOrderApi';
import { formatVND } from '../../utils/format';
import type { OrderResource, OrderItemResource } from '../../types/api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

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

const itemColumns: ColumnsType<OrderItemResource> = [
  { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name' },
  {
    title: 'Số lượng', dataIndex: 'quantity', key: 'quantity',
    render: (qty: string) => parseInt(qty), width: 100,
  },
  {
    title: 'Đơn giá', dataIndex: 'price_vnd', key: 'price_vnd',
    render: (price: number) => formatVND(price), width: 130,
  },
  {
    title: 'Thành tiền', dataIndex: 'subtotal_vnd', key: 'subtotal_vnd',
    render: (amount: number) => formatVND(amount), width: 130,
  },
];

export default function MyOrdersPage() {
  const orders = useOrderHistoryStore((s) => s.orders);
  const updateOrder = useOrderHistoryStore((s) => s.updateOrder);
  const [selectedOrder, setSelectedOrder] = useState<OrderResource | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshOrders() {
    if (orders.length === 0) return;
    setRefreshing(true);
    try {
      await Promise.allSettled(
        orders.map((o) =>
          adminOrderApi.getById(o.id).then((fresh) => updateOrder(fresh))
        )
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    refreshOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: ColumnsType<OrderResource> = [
    {
      title: 'Mã đơn', dataIndex: 'id', key: 'id',
      render: (id: number) => `#${id}`, width: 90,
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
        <Tag color={ORDER_STATUS_COLORS[status] ?? 'default'}>
          {ORDER_STATUS_LABELS[status] ?? record.order_status_label}
        </Tag>
      ),
      width: 160,
    },
    {
      title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount',
      render: (amount: string) => formatVND(parseFloat(amount)), width: 150,
    },
    {
      title: 'Chi tiết', key: 'action', width: 120, align: 'center',
      render: (_: unknown, record: OrderResource) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={() => setSelectedOrder(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Đơn hàng của tôi</Title>
        {orders.length > 0 && (
          <Button
            icon={refreshing ? <Spin size="small" /> : <ReloadOutlined />}
            onClick={refreshOrders}
            disabled={refreshing}
          >
            Cập nhật trạng thái
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <Empty description="Bạn chưa có đơn hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Link to="/"><Button type="primary">Mua sắm ngay</Button></Link>
        </Empty>
      ) : (
        <Table<OrderResource>
          dataSource={orders}
          columns={columns}
          rowKey="id"
          scroll={{ x: 500 }}
          loading={refreshing}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
        />
      )}

      <Modal
        open={selectedOrder !== null}
        onCancel={() => setSelectedOrder(null)}
        footer={<Button onClick={() => setSelectedOrder(null)}>Đóng</Button>}
        title={selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.id}` : ''}
        width={680}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Trạng thái">
                <Tag color={ORDER_STATUS_COLORS[selectedOrder.order_status] ?? 'default'}>
                  {ORDER_STATUS_LABELS[selectedOrder.order_status] ?? selectedOrder.order_status_label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedOrder.customer_name}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedOrder.customer_phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>{selectedOrder.delivery_address}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán">{selectedOrder.payment_method_label}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">{selectedOrder.payment_status_label}</Descriptions.Item>
            </Descriptions>
            <Table<OrderItemResource>
              dataSource={selectedOrder.items}
              columns={itemColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 400 }}
              style={{ marginBottom: 12 }}
            />
            <div style={{ textAlign: 'right' }}>
              <Text strong style={{ fontSize: 15 }}>
                Tổng cộng: {formatVND(parseFloat(selectedOrder.total_amount))}
              </Text>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
