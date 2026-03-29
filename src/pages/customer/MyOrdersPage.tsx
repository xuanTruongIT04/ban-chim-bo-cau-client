import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Table,
  Tag,
  Button,
  Modal,
  Empty,
  Alert,
  Descriptions,
  Space,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';
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

const itemColumns: ColumnsType<OrderItemResource> = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    key: 'quantity',
    render: (qty: string) => parseInt(qty),
    width: 100,
  },
  {
    title: 'Đơn giá',
    dataIndex: 'price_vnd',
    key: 'price_vnd',
    render: (price: number) => formatVND(price),
    width: 130,
  },
  {
    title: 'Thành tiền',
    dataIndex: 'subtotal_vnd',
    key: 'subtotal_vnd',
    render: (amount: number) => formatVND(amount),
    width: 130,
  },
];

export default function MyOrdersPage() {
  const { orders, clearHistory } = useOrderHistoryStore();
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const handleClearHistory = () => {
    Modal.confirm({
      title: 'Xóa lịch sử đơn hàng?',
      content: 'Tất cả đơn hàng đã lưu trên trình duyệt này sẽ bị xóa. Bạn có chắc chắn?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        clearHistory();
      },
    });
  };

  const columns: ColumnsType<OrderResource> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
      width: 90,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string, record: OrderResource) => (
        <Tag color={ORDER_STATUS_COLORS[status] ?? 'default'}>
          {record.order_status_label}
        </Tag>
      ),
      width: 150,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: string) => formatVND(parseFloat(amount)),
      width: 150,
    },
  ];

  const expandedRowRender = (record: OrderResource) => (
    <div style={{ padding: '8px 0' }}>
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2 }}
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Khách hàng">{record.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{record.customer_phone}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
          {record.delivery_address}
        </Descriptions.Item>
        <Descriptions.Item label="Thanh toán">{record.payment_method_label}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          {record.payment_status_label}
        </Descriptions.Item>
      </Descriptions>

      <Table<OrderItemResource>
        dataSource={record.items}
        columns={itemColumns}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ marginBottom: 8 }}
      />

      <div style={{ textAlign: 'right' }}>
        <Text strong>Tổng cộng: {formatVND(parseFloat(record.total_amount))}</Text>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Đơn hàng của tôi</Title>
        {orders.length > 0 && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearHistory}
            size="small"
          >
            Xóa lịch sử
          </Button>
        )}
      </div>

      <Alert
        message="Lịch sử đơn hàng chỉ lưu trên trình duyệt này"
        description="Dữ liệu đơn hàng được lưu cục bộ. Xóa bộ nhớ trình duyệt hoặc dùng thiết bị khác sẽ không thấy lịch sử này."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        closable
      />

      {orders.length === 0 ? (
        <Empty
          description="Bạn chưa có đơn hàng nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Link to="/">
            <Button type="primary">Mua sắm ngay</Button>
          </Link>
        </Empty>
      ) : (
        <Table<OrderResource>
          dataSource={orders}
          columns={columns}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(
                expanded
                  ? [...expandedRowKeys, record.id]
                  : expandedRowKeys.filter((k) => k !== record.id),
              );
            },
          }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
        />
      )}
    </div>
  );
}
