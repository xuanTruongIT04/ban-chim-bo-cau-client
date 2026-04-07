import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Radio,
  Descriptions,
  message,
  Spin,
  Result,
  Divider,
  Modal,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  SmileOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { checkoutApi } from '../../api/checkoutApi';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../stores/cartStore';
import { useOrderHistoryStore } from '../../stores/orderHistoryStore';
import { formatVND } from '../../utils/format';
import type { CheckoutPayload, OrderResource } from '../../types/api';

const { Title, Text } = Typography;

interface CheckoutFormValues {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  note?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CheckoutFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResource | null>(null);
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });
  const addOrder = useOrderHistoryStore((s) => s.addOrder);

  const { data: cart, isLoading, isError, refetch } = useCart();

  const onFinish = async (values: CheckoutFormValues) => {
    setSubmitting(true);
    try {
      const payload: CheckoutPayload = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        delivery_address: values.delivery_address,
        payment_method: 'cod',
      };
      const order = await checkoutApi.submit(payload, idempotencyKey);
      addOrder(order);
      // Hiện modal trước — chưa clear cart, chưa navigate
      setCompletedOrder(order);
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
      };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        const fields = Object.entries(axiosError.response.data.errors).map(([name, errors]) => ({
          name: name as keyof CheckoutFormValues,
          errors,
        }));
        form.setFields(fields);
      } else {
        message.error('Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin và thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  function clearCartAndGo(destination: string) {
    useCartStore.getState().clearCartToken();
    queryClient.removeQueries({ queryKey: ['cart'] });
    navigate(destination);
  }

  // --- Loading / error states ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <Result
          status="error"
          title="Không tải được giỏ hàng"
          subTitle="Đã có lỗi xảy ra khi tải thông tin giỏ hàng."
          extra={<Button type="primary" size="large" onClick={() => refetch()}>Thử lại</Button>}
        />
      </div>
    );
  }

  // Guard: giỏ trống thì redirect — chỉ khi chưa có completedOrder
  if (!completedOrder && (!cart || cart.items.length === 0)) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <>
      {/* Success modal — hiện sau khi API trả về thành công */}
      <Modal
        open={!!completedOrder}
        footer={null}
        closable={false}
        centered
        width={420}
        styles={{ body: { textAlign: 'center', padding: '40px 32px 32px' } }}
      >
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 16, animation: 'successBounce 0.6s ease' }}>
          🎉
        </div>
        <SmileOutlined style={{ display: 'none' }} />
        <Title level={3} style={{ color: '#1b5e20', margin: '0 0 8px' }}>
          Đặt hàng thành công!
        </Title>
        <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: 8 }}>
          Mã đơn hàng: <strong>#{completedOrder?.id}</strong>
        </Text>
        <Text style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 28 }}>
          Chúng tôi sẽ liên hệ xác nhận sớm nhất. Cảm ơn bạn đã tin tưởng!
        </Text>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<UnorderedListOutlined />}
            style={{ height: 50, fontSize: 16, fontWeight: 700, borderRadius: 10 }}
            onClick={() => clearCartAndGo('/orders')}
          >
            Xem chi tiết đơn hàng
          </Button>
          <Button
            size="large"
            block
            icon={<ShoppingOutlined />}
            style={{ height: 50, fontSize: 16, fontWeight: 600, borderRadius: 10 }}
            onClick={() => clearCartAndGo('/')}
          >
            Tiếp tục mua hàng
          </Button>
        </Space>
        <style>{`
          @keyframes successBounce {
            0%   { transform: scale(0.3); opacity: 0; }
            60%  { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
      </Modal>

      {/* Checkout form */}
      <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <Title level={2} style={{ color: '#1b5e20', fontSize: 26 }}>
          Xác nhận đặt hàng
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
              <Title level={4} style={{ color: '#1b5e20', marginBottom: 20 }}>
                Thông tin giao hàng
              </Title>
              <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
                <Form.Item
                  label={<span style={{ fontSize: 16, fontWeight: 500 }}>Họ và tên</span>}
                  name="customer_name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên.' },
                    { max: 100, message: 'Họ và tên tối đa 100 ký tự.' },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" style={{ fontSize: 16 }} />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontSize: 16, fontWeight: 500 }}>Số điện thoại</span>}
                  name="customer_phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại.' },
                    { pattern: /^0\d{9}$/, message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.' },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại (VD: 0912345678)" style={{ fontSize: 16 }} />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontSize: 16, fontWeight: 500 }}>Địa chỉ giao hàng</span>}
                  name="delivery_address"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng.' }]}
                >
                  <Input.TextArea rows={3} placeholder="Nhập địa chỉ giao hàng" style={{ fontSize: 16 }} />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontSize: 16, fontWeight: 500 }}>Ghi chú (Có thể để trống)</span>}
                  name="note"
                >
                  <Input.TextArea rows={2} placeholder="Miêu tả thêm về đơn hàng nếu muốn" style={{ fontSize: 16 }} />
                </Form.Item>

                <Form.Item label={<span style={{ fontSize: 16, fontWeight: 500 }}>Phương thức thanh toán</span>}>
                  <Radio.Group value="cod" disabled>
                    <Radio value="cod" style={{ fontSize: 16 }}>Thanh toán khi nhận hàng (COD)</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={submitting}
                    size="large"
                    className="btn-cta-pulse"
                    style={{ height: 56, fontSize: 20, fontWeight: 700, borderRadius: 12 }}
                  >
                    <ThunderboltOutlined /> XÁC NHẬN ĐẶT HÀNG
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card
              title={<span style={{ fontSize: 18, fontWeight: 600, color: '#1b5e20' }}>Đơn hàng của bạn</span>}
              style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}
            >
              {cart && (
                <>
                  <Descriptions bordered column={1} size="small">
                    {cart.items.map((item) => (
                      <Descriptions.Item
                        key={item.id}
                        label={<span style={{ fontSize: 15 }}>{item.product_name} x {parseInt(item.quantity)}</span>}
                      >
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#c62828' }}>
                          {formatVND(item.subtotal)}
                        </span>
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                  <Divider />
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: 16, color: '#888' }}>Tổng cộng:</Text>
                    <Title level={3} style={{ margin: '4px 0 0', color: '#c62828', fontSize: 28 }}>
                      {formatVND(cart.total_amount)}
                    </Title>
                  </div>
                  <Divider />
                </>
              )}
              <Card size="small" style={{ background: '#f0f7f0', border: '1px solid #c8e6c9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Text style={{ color: '#2e7d32', fontSize: 14 }}>
                    <SafetyOutlined /> Chim tươi sống, đảm bảo chất lượng
                  </Text>
                  <Text style={{ color: '#2e7d32', fontSize: 14 }}>
                    <CheckCircleOutlined /> Nhận hàng mới trả tiền — An tâm mua sắm
                  </Text>
                  <Text style={{ color: '#2e7d32', fontSize: 14 }}>
                    <CheckCircleOutlined /> Hỗ trợ hotline: 0978 238 946
                  </Text>
                </div>
              </Card>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
