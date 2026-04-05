import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  List,
  Card,
  Button,
  Spin,
  Result,
  Divider,
  Tag,
} from 'antd';
import {
  ShoppingOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  PhoneOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import CartItemRow from '../../components/customer/CartItemRow';
import { formatVND } from '../../utils/format';
import type { CartItemResource } from '../../types/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  function handleUpdateQuantity(itemId: number, quantity: number) {
    updateCartItem.mutate({ itemId, quantity });
  }

  function handleRemove(itemId: number) {
    removeCartItem.mutate(itemId);
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
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

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🕊️</div>
        <Typography.Title level={3} style={{ color: '#1b5e20' }}>
          Giỏ hàng trống
        </Typography.Title>
        <Typography.Text style={{ fontSize: 17, color: '#888', display: 'block', marginBottom: 24 }}>
          Bạn chưa có sản phẩm nào trong giỏ hàng.
        </Typography.Text>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/')}
          style={{ height: 50, fontSize: 18, fontWeight: 600, borderRadius: 10 }}
        >
          Chọn chim ngay
        </Button>
      </div>
    );
  }

  const isMutating = updateCartItem.isPending || removeCartItem.isPending;

  return (
    <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <Typography.Title level={2} style={{ color: '#1b5e20', fontSize: 26, marginBottom: 4 }}>
        <ShoppingOutlined /> Giỏ hàng của bạn
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 20 }}>
        Kiểm tra lại đơn hàng trước khi đặt — giao tận nơi, thanh toán khi nhận hàng
      </Typography.Text>

      <Row gutter={[24, 24]}>
        {/* Danh sách sản phẩm */}
        <Col xs={24} md={16}>
          <List
            dataSource={cart.items}
            renderItem={(item: CartItemResource) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                updating={isMutating}
              />
            )}
            bordered
            style={{ background: '#ffffff', borderRadius: 12, borderColor: '#e0e0e0' }}
          />

          {/* Tiếp tục mua */}
          <Button
            type="link"
            onClick={() => navigate('/')}
            style={{ marginTop: 12, color: '#2e7d32', fontWeight: 500, fontSize: 15, padding: 0 }}
          >
            ← Tiếp tục chọn chim
          </Button>
        </Col>

        {/* Sidebar tóm tắt */}
        <Col xs={24} md={8}>
          <Card
            style={{ borderRadius: 12, border: '2px solid #c8e6c9', boxShadow: '0 4px 16px rgba(46,125,50,0.08)' }}
            styles={{ body: { padding: 20 } }}
          >
            {/* Tóm tắt giá */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text style={{ fontSize: 15, color: '#666' }}>
                  {cart.items.length} sản phẩm
                </Typography.Text>
                <Typography.Text style={{ fontSize: 15 }}>
                  {formatVND(cart.total_amount)}
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text style={{ fontSize: 15, color: '#666' }}>Phí giao hàng</Typography.Text>
                <Tag color="green" style={{ fontWeight: 600 }}>Miễn phí</Tag>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <Typography.Text strong style={{ fontSize: 17 }}>Tổng cộng:</Typography.Text>
              <Typography.Title level={2} style={{ color: '#c62828', margin: 0, fontSize: 28 }}>
                {formatVND(cart.total_amount)}
              </Typography.Title>
            </div>

            {/* CTA button */}
            <Button
              type="primary"
              block
              size="large"
              onClick={() => navigate('/checkout')}
              className="btn-cta-pulse"
              style={{
                height: 56,
                fontSize: 19,
                fontWeight: 700,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <ThunderboltOutlined /> ĐẶT HÀNG NGAY
            </Button>

            {/* Trust signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleFilled style={{ color: '#2e7d32', fontSize: 15 }} />
                <Typography.Text style={{ fontSize: 13, color: '#555' }}>
                  Thanh toán khi nhận hàng — không rủi ro
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CarOutlined style={{ color: '#2e7d32', fontSize: 15 }} />
                <Typography.Text style={{ fontSize: 13, color: '#555' }}>
                  Giao hàng tận nơi, miễn phí vận chuyển
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined style={{ color: '#2e7d32', fontSize: 15 }} />
                <Typography.Text style={{ fontSize: 13, color: '#555' }}>
                  Chim tươi sống, đảm bảo chất lượng
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined style={{ color: '#2e7d32', fontSize: 15 }} />
                <Typography.Text style={{ fontSize: 13, color: '#555' }}>
                  Hỗ trợ: <strong>0978 238 946</strong>
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
