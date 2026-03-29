import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Result, Typography, Descriptions, Table, Button, Space } from 'antd';
import { formatVND } from '../../utils/format';
import type { OrderResource, OrderItemResource } from '../../types/api';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';

const { Text } = Typography;

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as OrderResource | undefined;

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);

  // Save order to local history when confirmation page mounts
  useEffect(() => {
    if (order) {
      useOrderHistoryStore.getState().addOrder(order);
    }
  }, [order]);

  if (!order) {
    return null;
  }

  const itemColumns = [
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
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal_vnd',
      key: 'subtotal_vnd',
      render: (amount: number) => formatVND(amount),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle="Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất."
        extra={
          <Space>
            <Link to="/">
              <Button type="primary">Tiếp tục mua sắm</Button>
            </Link>
            <Link to="/orders">
              <Button>Xem đơn hàng của tôi</Button>
            </Link>
          </Space>
        }
      />

      <div style={{ marginTop: 24 }}>
        <Text copyable={{ text: String(order.id) }}>
          Mã đơn hàng: #{order.id}
        </Text>

        <Descriptions
          bordered
          column={1}
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          <Descriptions.Item label="Khách hàng">{order.customer_name}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{order.customer_phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">{order.delivery_address}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{order.order_status_label}</Descriptions.Item>
          <Descriptions.Item label="Thanh toán">{order.payment_method_label}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatVND(parseInt(order.total_amount))}
          </Descriptions.Item>
        </Descriptions>

        <Table<OrderItemResource>
          dataSource={order.items}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
}
