import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Result, Typography, Descriptions, Table, Button, Space, Card } from 'antd';
import { SmileOutlined, PhoneOutlined } from '@ant-design/icons';
import { formatVND } from '../../utils/format';
import type { OrderResource, OrderItemResource } from '../../types/api';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';

const { Text, Title } = Typography;

const CONFETTI_COLORS = ['#2e7d32', '#66bb6a', '#ffd54f', '#ff7043', '#42a5f5', '#ab47bc', '#ef5350'];

function createConfetti() {
  const container = document.createElement('div');
  container.id = 'confetti-container';
  document.body.appendChild(container);

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = `${Math.random() * 2}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.width = `${8 + Math.random() * 8}px`;
    piece.style.height = `${8 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 5000);
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as OrderResource | undefined;

  const triggerConfetti = useCallback(() => {
    createConfetti();
  }, []);

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
      return;
    }
    // Trigger celebration confetti
    triggerConfetti();
  }, [order, navigate, triggerConfetti]);

  // Save order to local history
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
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#c62828' }}>{formatVND(amount)}</span>
      ),
    },
  ];

  return (
    <div className="fade-in-up" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {/* Success banner */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
          border: '1px solid #a5d6a7',
          borderRadius: 16,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <Result
          icon={<SmileOutlined style={{ color: '#2e7d32', fontSize: 64 }} />}
          title={
            <Title level={2} style={{ color: '#1b5e20', margin: 0 }}>
              Đặt hàng thành công!
            </Title>
          }
          subTitle={
            <Text style={{ fontSize: 17, color: '#333' }}>
              Cảm ơn bạn đã tin tưởng <strong>Quý Chim - Phú Bình</strong>!
              <br />
              Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
            </Text>
          }
          extra={
            <Space size="middle" wrap>
              <Link to="/">
                <Button type="primary" size="large" style={{ fontWeight: 600 }}>
                  Tiếp tục mua sắm
                </Button>
              </Link>
              <Link to="/orders">
                <Button size="large" style={{ fontWeight: 600 }}>
                  Xem đơn hàng của tôi
                </Button>
              </Link>
            </Space>
          }
        />

        <div style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 15, color: '#2e7d32' }}>
            <PhoneOutlined /> Hotline hỗ trợ: <strong>0946 477 117</strong>
          </Text>
        </div>
      </Card>

      {/* Order details */}
      <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
        <Text copyable={{ text: String(order.id) }} style={{ fontSize: 16, fontWeight: 600 }}>
          Mã đơn hàng: #{order.id}
        </Text>

        <Descriptions
          bordered
          column={1}
          style={{ marginTop: 16, marginBottom: 24 }}
          size="small"
        >
          <Descriptions.Item label={<span style={{ fontSize: 15 }}>Khách hàng</span>}>
            <span style={{ fontSize: 15 }}>{order.customer_name}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: 15 }}>Số điện thoại</span>}>
            <span style={{ fontSize: 15 }}>{order.customer_phone}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: 15 }}>Địa chỉ giao hàng</span>}>
            <span style={{ fontSize: 15 }}>{order.delivery_address}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: 15 }}>Trạng thái</span>}>
            <span className="status-new-pulse" style={{
              display: 'inline-block',
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '2px 12px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
            }}>
              {order.order_status_label}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: 15 }}>Thanh toán</span>}>
            <span style={{ fontSize: 15 }}>{order.payment_method_label}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ fontSize: 15, fontWeight: 600 }}>Tổng tiền</span>}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#c62828' }}>
              {formatVND(parseInt(order.total_amount))}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Table<OrderItemResource>
          dataSource={order.items}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
