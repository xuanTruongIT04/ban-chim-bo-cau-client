import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'antd';
import { CheckCircleOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { checkoutApi } from '../../api/checkoutApi';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../stores/cartStore';
import { formatVND } from '../../utils/format';
import type { CheckoutPayload } from '../../types/api';

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
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const { data: cart, isLoading, isError, refetch } = useCart();

  useEffect(() => {
    if (!isLoading && (!cart || cart.items.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cart, isLoading, navigate]);

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
      useCartStore.getState().clearCartToken();
      queryClient.removeQueries({ queryKey: ['cart'] });
      navigate('/orders/confirm', { state: { order } });
    } catch (error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
        const fields = Object.entries(axiosError.response.data.errors).map(([name, errors]) => ({
          name,
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
          extra={
            <Button type="primary" size="large" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <Title level={2} style={{ color: '#1b5e20', fontSize: 26 }}>
        Xác nhận đặt hàng
      </Title>
      <Row gutter={[24, 24]}>
        {/* Form column */}
        <Col xs={24} md={14}>
          <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <Title level={4} style={{ color: '#1b5e20', marginBottom: 20 }}>
              Thông tin giao hàng
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
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
                  {
                    pattern: /^0\d{9}$/,
                    message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.',
                  },
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
                label={<span style={{ fontSize: 16, fontWeight: 500 }}>Ghi chú</span>}
                name="note"
              >
                <Input.TextArea rows={2} placeholder="Ngày giờ giao hàng mong muốn (VD: Nhà 4 tầng, có mái tôn đỏ, cửa xanh, ...)" style={{ fontSize: 16 }} />
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
                  style={{
                    height: 56,
                    fontSize: 20,
                    fontWeight: 700,
                    borderRadius: 12,
                  }}
                >
                  <ThunderboltOutlined /> XÁC NHẬN ĐẶT HÀNG
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Summary column */}
        <Col xs={24} md={10}>
          <Card
            title={<span style={{ fontSize: 18, fontWeight: 600, color: '#1b5e20' }}>Đơn hàng của bạn</span>}
            style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}
          >
            <Descriptions bordered column={1} size="small">
              {cart.items.map((item) => (
                <Descriptions.Item
                  key={item.id}
                  label={
                    <span style={{ fontSize: 15 }}>
                      {item.product_name} x {parseInt(item.quantity)}
                    </span>
                  }
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

            {/* Trust signals */}
            <Divider />
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
  );
}
