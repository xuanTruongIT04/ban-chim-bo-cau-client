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
} from 'antd';
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
        // NOTE: 'note' is intentionally NOT included — backend has no note field
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
            <Button type="primary" onClick={() => refetch()}>
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>Đặt hàng</Title>
      <Row gutter={[24, 24]}>
        {/* Form column */}
        <Col xs={24} md={14}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Họ và tên"
                name="customer_name"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên.' },
                  { max: 100, message: 'Họ và tên tối đa 100 ký tự.' },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="customer_phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại.' },
                  {
                    pattern: /^0\d{9}$/,
                    message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.',
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại (VD: 0912345678)" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ giao hàng"
                name="delivery_address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng.' }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ giao hàng" />
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea rows={2} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" />
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                  (Tính năng đang cập nhật)
                </Text>
              </Form.Item>

              <Form.Item label="Phương thức thanh toán">
                <Radio.Group value="cod" disabled>
                  <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={submitting}
                  size="large"
                >
                  Đặt hàng ngay
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Summary column */}
        <Col xs={24} md={10}>
          <Card title="Đơn hàng của bạn">
            <Descriptions bordered column={1} size="small">
              {cart.items.map((item) => (
                <Descriptions.Item
                  key={item.id}
                  label={`${item.product_name} x ${parseInt(item.quantity)}`}
                >
                  {formatVND(item.subtotal)}
                </Descriptions.Item>
              ))}
            </Descriptions>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Title level={4} style={{ margin: 0 }}>
                Tổng: {formatVND(cart.total_amount)}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
