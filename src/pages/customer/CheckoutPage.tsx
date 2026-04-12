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
  Divider,
  Modal,
  Space,
  App,
  theme,
} from 'antd';
import {
  CheckCircleFilled,
  ArrowRightOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
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

function CheckoutSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    borderRadius: 8,
  } as const;
  return (
    <>
      <style>{`@keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ ...shimmer, height: 30, width: 220, marginBottom: 24 }} />
        <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <div style={{ ...shimmer, height: 440, borderRadius: 12 }} />
          </Col>
          <Col xs={24} md={10}>
            <div style={{ ...shimmer, height: 320, borderRadius: 12 }} />
          </Col>
        </Row>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { token: designToken } = theme.useToken();

  const [form] = Form.useForm<CheckoutFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResource | null>(null);

  // Idempotency key — generated once per page mount
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  });

  const addOrder = useOrderHistoryStore((s) => s.addOrder);
  const { data: cart, isLoading, isError, refetch } = useCart();

  async function onFinish(values: CheckoutFormValues) {
    setSubmitting(true);
    try {
      const payload: CheckoutPayload = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        delivery_address: values.delivery_address,
        note: values.note,
      };
      const { order } = await checkoutApi.submit(payload, idempotencyKey);
      addOrder(order);
      setCompletedOrder(order);
    } catch (error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } };
      };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        form.setFields(
          Object.entries(axiosError.response.data.errors).map(([name, errors]) => ({
            name: name as keyof CheckoutFormValues,
            errors,
          })),
        );
      } else {
        message.error('Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin và thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function clearCartAndGo(destination: string) {
    useCartStore.getState().clearCartToken();
    queryClient.removeQueries({ queryKey: ['cart'] });
    navigate(destination);
  }

  if (isLoading) return <CheckoutSkeleton />;

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '32px 0' }}>
          <Text style={{ fontSize: 15, color: '#595959', display: 'block', marginBottom: 16 }}>
            Không tải được giỏ hàng. Vui lòng thử lại.
          </Text>
          <Button type="primary" onClick={() => refetch()}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  if (!completedOrder && (!cart || cart.items.length === 0)) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <>
      {/* ── Success Modal ────────────────────────────────────────────── */}
      <Modal
        open={!!completedOrder}
        footer={null}
        closable={false}
        centered
        /* Responsive width: never wider than viewport on mobile */
        width="min(400px, calc(100vw - 32px))"
        styles={{ body: { textAlign: 'center', padding: '32px 24px 28px' } }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#e8f5e9',
            border: '3px solid #2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'successScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <CheckCircleFilled style={{ fontSize: 36, color: '#2e7d32' }} />
        </div>

        <Title level={3} style={{ margin: '0 0 6px' }}>
          Đặt hàng thành công!
        </Title>
        <Text style={{ fontSize: 14, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>
          Mã đơn hàng: <strong style={{ color: '#1a1a1a' }}>#{completedOrder?.id}</strong>
        </Text>
        <Text style={{ fontSize: 14, color: '#8c8c8c', display: 'block', marginBottom: 16 }}>
          Chúng tôi sẽ gọi điện xác nhận đơn hàng trong thời gian sớm nhất.
        </Text>

        {/* Next-step guide — khách cần biết CHÍNH XÁC điều gì xảy ra tiếp theo */}
        <div
          style={{
            background: '#e8f5e9',
            border: '1.5px solid #a5d6a7',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
            textAlign: 'left',
          }}
        >
          <Text strong style={{ fontSize: 13, color: '#1b5e20', display: 'block', marginBottom: 10 }}>
            📋 Bước tiếp theo:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                background: '#2e7d32', color: '#fff',
                width: 20, height: 20, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>1</span>
              <Text style={{ fontSize: 13, color: '#2e7d32' }}>
                Nhân viên gọi đến{' '}
                <a
                  href={`tel:${completedOrder?.customer_phone}`}
                  style={{ color: '#1b5e20', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {completedOrder?.customer_phone}
                </a>{' '}
                để xác nhận đơn hàng
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                background: '#2e7d32', color: '#fff',
                width: 20, height: 20, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>2</span>
              <Text style={{ fontSize: 13, color: '#595959' }}>
                Giao hàng tận nơi — <strong>Trả tiền khi nhận hàng</strong>
              </Text>
            </div>
          </div>
        </div>

        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block
            icon={<UnorderedListOutlined />}
            onClick={() => clearCartAndGo('/orders')}
            style={{ height: 48, fontWeight: 700, borderRadius: 8 }}
          >
            Xem đơn hàng của tôi
          </Button>
          <Button
            size="large"
            block
            icon={<ShoppingOutlined />}
            onClick={() => clearCartAndGo('/')}
            style={{ height: 48, fontWeight: 600, borderRadius: 8 }}
          >
            Tiếp tục mua hàng
          </Button>
        </Space>

        <style>{`
          @keyframes successScale {
            0%   { transform: scale(0.3); opacity: 0; }
            70%  { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
      </Modal>

      {/* ── Checkout Form ────────────────────────────────────────────── */}
      <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 48px' }}>
        <div className="section-header-line" style={{ marginBottom: 24 }}>
          <div className="section-header-bar" />
          <Title level={3} style={{ margin: 0 }}>Xác nhận đặt hàng</Title>
        </div>

        {/* Column order: on mobile summary first (via CSS .checkout-summary-col order:1),
            form second. On desktop left-form / right-summary (natural order). */}
        <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* ── Delivery Form ─────────────────────────────────────── */}
          <Col xs={24} md={14} className="checkout-form-col">
            <Card
              style={{
                borderRadius: 12,
                border: `1px solid ${designToken.colorBorderSecondary}`,
              }}
              styles={{ body: { padding: 24 } }}
            >
              <Title level={5} style={{ margin: '0 0 20px', color: designToken.colorPrimary }}>
                Thông tin giao hàng
              </Title>

              <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="on">
                <Form.Item
                  label="Họ và tên"
                  name="customer_name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên.' },
                    { max: 100, message: 'Tối đa 100 ký tự.' },
                  ]}
                >
                  <Input size="large" placeholder="VD: Nguyễn Văn A" autoComplete="name" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="customer_phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại.' },
                    { pattern: /^0\d{9}$/, message: 'Số điện thoại 10 chữ số, bắt đầu bằng 0.' },
                  ]}
                >
                  <Input size="large" placeholder="VD: 0912 345 678" autoComplete="tel" inputMode="tel" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="delivery_address"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng.' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Số nhà, tên đường, xã/phường, quận/huyện..."
                    autoComplete="street-address"
                  />
                </Form.Item>

                <Form.Item label="Ghi chú (không bắt buộc)" name="note">
                  <Input.TextArea
                    rows={2}
                    placeholder="Lưu ý thêm về đơn hàng nếu cần..."
                  />
                </Form.Item>

                <div
                  style={{
                    background: designToken.colorPrimaryBg,
                    border: `1.5px solid ${designToken.colorBorderSecondary}`,
                    borderRadius: 8,
                    padding: '12px 14px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>📞</span>
                  <div>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>Thanh toán khi nhận hàng</Text>
                    <Text style={{ fontSize: 13, color: '#595959' }}>
                      Nhân viên sẽ gọi điện xác nhận đơn — thanh toán khi nhận hàng. An toàn, tiện lợi.
                    </Text>
                  </div>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={submitting}
                    size="large"
                    icon={<ArrowRightOutlined />}
                    className="btn-cta-pulse"
                    style={{
                      height: 52,
                      fontSize: 17,
                      fontWeight: 700,
                      borderRadius: 10,
                    }}
                  >
                    Xác nhận đặt hàng
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* ── Order Summary — appears ABOVE form on mobile via CSS ─── */}
          <Col xs={24} md={10} className="checkout-summary-col">
            <Card
              style={{
                borderRadius: 12,
                border: `1px solid ${designToken.colorBorderSecondary}`,
                position: 'sticky',
                top: 80,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <Title level={5} style={{ margin: '0 0 16px' }}>
                Đơn hàng của bạn
              </Title>

              {cart && (
                <>
                  {/* Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#595959', flex: 1 }}>
                          {item.product_name}
                          <span style={{ color: '#8c8c8c', marginLeft: 4 }}>
                            ×{parseInt(item.quantity)}
                          </span>
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            color: designToken.colorWarning,
                            whiteSpace: 'nowrap',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatVND(item.subtotal)}
                        </Text>
                      </div>
                    ))}
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  {/* Shipping */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#595959' }}>Phí vận chuyển</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: designToken.colorPrimary,
                      }}
                    >
                      Miễn phí
                    </Text>
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      background: '#fdf3e0',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 20,
                    }}
                  >
                    <Text strong style={{ fontSize: 15 }}>Tổng cộng</Text>
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: designToken.colorWarning,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {formatVND(cart.total_amount)}
                    </span>
                  </div>
                </>
              )}

              {/* Trust signals */}
              <div
                style={{
                  background: '#f8faf8',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {[
                  { icon: <CheckCircleFilled />, text: 'Nhận hàng mới trả tiền — An tâm 100%' },
                  { icon: <CarOutlined />,        text: 'Giao hàng tận nơi, miễn phí' },
                  { icon: <SafetyCertificateOutlined />, text: 'Chim tươi sống đảm bảo' },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: designToken.colorPrimary, fontSize: 13, flexShrink: 0 }}>
                      {icon}
                    </span>
                    <Text style={{ fontSize: 12, color: '#595959' }}>{text}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
