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
import type { BankInfo, CheckoutPayload, OrderResource } from '../../types/api';

const { Title, Text } = Typography;

interface CheckoutFormValues {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: 'cod' | 'chuyen_khoan';
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
  const paymentMethod = Form.useWatch('payment_method', form) ?? 'cod';
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResource | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

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
        payment_method: values.payment_method,
        note: values.note,
      };
      const { order, bank_info } = await checkoutApi.submit(payload, idempotencyKey);
      addOrder(order);
      setCompletedOrder(order);
      if (bank_info) setBankInfo(bank_info);
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
            background: '#e8f0fe',
            border: `3px solid ${designToken.colorPrimary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'successScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <CheckCircleFilled style={{ fontSize: 36, color: designToken.colorPrimary }} />
        </div>

        <Title level={3} style={{ margin: '0 0 6px' }}>
          Đặt hàng thành công!
        </Title>
        <Text style={{ fontSize: 14, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>
          Mã đơn hàng: <strong style={{ color: '#1a1a1a' }}>#{completedOrder?.id}</strong>
        </Text>
        <Text style={{ fontSize: 14, color: '#8c8c8c', display: 'block', marginBottom: bankInfo ? 16 : 28 }}>
          Chúng tôi sẽ liên hệ xác nhận đơn trong thời gian sớm nhất.
        </Text>

        {/* Bank transfer info */}
        {bankInfo && (
          <div
            style={{
              background: designToken.colorPrimaryBg,
              border: `1px solid ${designToken.colorBorderSecondary}`,
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 20,
              textAlign: 'left',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 8, color: designToken.colorPrimary, fontSize: 13 }}>
              Thông tin chuyển khoản
            </Text>
            {[
              { label: 'Ngân hàng', value: bankInfo.bank_name },
              { label: 'Số tài khoản', value: bankInfo.account_number },
              { label: 'Chủ tài khoản', value: bankInfo.account_name },
              ...(bankInfo.branch ? [{ label: 'Chi nhánh', value: bankInfo.branch }] : []),
              { label: 'Nội dung CK', value: `DH${completedOrder?.id ?? ''}` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                <Text style={{ fontSize: 13, color: '#8c8c8c', flexShrink: 0 }}>{row.label}</Text>
                <Text strong style={{ fontSize: 13 }}>{row.value}</Text>
              </div>
            ))}
          </div>
        )}

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

              <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" initialValues={{ payment_method: 'cod' }}>
                <Form.Item
                  label="Họ và tên"
                  name="customer_name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên.' },
                    { max: 100, message: 'Tối đa 100 ký tự.' },
                  ]}
                >
                  <Input size="large" placeholder="VD: Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="customer_phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại.' },
                    { pattern: /^0\d{9}$/, message: 'Số điện thoại 10 chữ số, bắt đầu bằng 0.' },
                  ]}
                >
                  <Input size="large" placeholder="VD: 0912 345 678" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="delivery_address"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng.' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Số nhà, tên đường, xã/phường, quận/huyện..."
                  />
                </Form.Item>

                <Form.Item label="Ghi chú (không bắt buộc)" name="note">
                  <Input.TextArea
                    rows={2}
                    placeholder="Lưu ý thêm về đơn hàng nếu cần..."
                  />
                </Form.Item>

                <Form.Item label="Phương thức thanh toán" name="payment_method">
                  <Radio.Group style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div
                        style={{
                          border: `1.5px solid ${paymentMethod === 'cod' ? designToken.colorPrimary : designToken.colorBorder}`,
                          borderRadius: 8,
                          padding: '12px 14px',
                          background: paymentMethod === 'cod' ? designToken.colorPrimaryBg : '#fff',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                        onClick={() => form.setFieldValue('payment_method', 'cod')}
                      >
                        <Radio value="cod">
                          <Text strong style={{ fontSize: 14 }}>Thanh toán khi nhận hàng (COD)</Text>
                          <Text style={{ fontSize: 13, color: '#595959', display: 'block', marginTop: 2, marginLeft: 0 }}>
                            Nhận hàng rồi mới trả tiền — an toàn, tiện lợi
                          </Text>
                        </Radio>
                      </div>
                      <div
                        style={{
                          border: `1.5px solid ${paymentMethod === 'chuyen_khoan' ? designToken.colorPrimary : designToken.colorBorder}`,
                          borderRadius: 8,
                          padding: '12px 14px',
                          background: paymentMethod === 'chuyen_khoan' ? designToken.colorPrimaryBg : '#fff',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                        onClick={() => form.setFieldValue('payment_method', 'chuyen_khoan')}
                      >
                        <Radio value="chuyen_khoan">
                          <Text strong style={{ fontSize: 14 }}>Chuyển khoản ngân hàng</Text>
                          <Text style={{ fontSize: 13, color: '#595959', display: 'block', marginTop: 2 }}>
                            Thông tin tài khoản sẽ hiển thị sau khi đặt hàng
                          </Text>
                        </Radio>
                      </div>
                    </div>
                  </Radio.Group>
                </Form.Item>

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
