import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  List,
  Card,
  Button,
  Result,
  Divider,
  Tag,
  theme,
} from 'antd';
import {
  ShoppingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import CartItemRow from '../../components/customer/CartItemRow';
import { formatVND } from '../../utils/format';
import type { CartItemResource } from '../../types/api';

const { Title, Text } = Typography;

function CartSkeleton() {
  const s = {
    background: 'linear-gradient(90deg,#ede8df 0%,#f5f2ec 50%,#ede8df 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    borderRadius: 8,
  } as const;
  return (
    <>
      <style>{`@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ ...s, height: 28, width: 200, marginBottom: 20 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #ede8df', alignItems: 'center' }}>
            <div style={{ ...s, width: 76, height: 76, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...s, height: 14, width: '70%', marginBottom: 8 }} />
              <div style={{ ...s, height: 13, width: '40%', marginBottom: 12 }} />
              <div style={{ ...s, height: 32, width: 108 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { token: designToken } = theme.useToken();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  if (isLoading) return <CartSkeleton />;

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px' }}>
        <Result
          status="error"
          title="Không tải được giỏ hàng"
          extra={<Button type="primary" size="large" onClick={() => refetch()}>Thử lại</Button>}
        />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div style={{ maxWidth: 460, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 12, lineHeight: 1 }}>🕊️</div>
        <Title level={3} style={{ color: designToken.colorPrimary, marginBottom: 8 }}>
          Giỏ hàng đang trống
        </Title>
        <Text style={{ fontSize: 15, color: '#8c8c8c', display: 'block', marginBottom: 28 }}>
          Thêm sản phẩm vào giỏ để bắt đầu đặt hàng!
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<ShoppingOutlined />}
          onClick={() => navigate('/')}
          className="btn-cta-pulse"
          style={{ height: 50, fontSize: 16, fontWeight: 700, borderRadius: 10, width: '100%' }}
        >
          Chọn chim ngay
        </Button>
      </div>
    );
  }

  const isMutating = updateCartItem.isPending || removeCartItem.isPending;

  return (
    <>
      {/* ── Floating bottom bar — mobile only (via CSS) ────────────────── */}
      <div className="cart-floating-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', lineHeight: 1.2 }}>
            {cart.items.length} sản phẩm
          </Text>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: designToken.colorWarning,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {formatVND(cart.total_amount)}
          </span>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/checkout')}
          style={{
            height: 50,
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 10,
            flexShrink: 0,
            minWidth: 140,
          }}
        >
          Đặt hàng
        </Button>
      </div>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <div
        className="fade-in-up cart-page-content"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-header-line">
            <div className="section-header-bar" />
            <Title level={4} style={{ margin: 0, fontSize: 17 }}>
              Giỏ hàng ({cart.items.length})
            </Title>
          </div>
          <Text style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4, display: 'block' }}>
            Giao tận nơi · Thanh toán khi nhận hàng
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <Col xs={24} md={16}>
            <List
              dataSource={cart.items}
              renderItem={(item: CartItemResource) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(id, q) => updateCartItem.mutate({ itemId: id, quantity: q })}
                  onRemove={(id) => removeCartItem.mutate(id)}
                  updating={isMutating}
                />
              )}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: `1px solid ${designToken.colorBorderSecondary}`,
                overflow: 'hidden',
              }}
            />

            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{
                marginTop: 10,
                color: designToken.colorPrimary,
                fontWeight: 500,
                fontSize: 14,
                padding: 0,
              }}
            >
              Tiếp tục chọn hàng
            </Button>
          </Col>

          {/* ── Order Summary — desktop sidebar, stacked on mobile ──────── */}
          <Col xs={24} md={8}>
            <Card
              className="cart-summary-card"
              style={{
                borderRadius: 12,
                border: `2px solid ${designToken.colorPrimary}28`,
                boxShadow: '0 4px 16px rgba(25,118,210,0.08)',
                position: 'sticky',
                top: 72,
              }}
              styles={{ body: { padding: 18 } }}
            >
              <Title level={5} style={{ margin: '0 0 14px', color: '#1a1a1a', fontSize: 15 }}>
                Tóm tắt đơn hàng
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#595959' }}>{cart.items.length} sản phẩm</Text>
                  <Text style={{ fontSize: 14 }}>{formatVND(cart.total_amount)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#595959' }}>Phí vận chuyển</Text>
                  <Tag
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      background: '#e8f0fe',
                      border: `1px solid ${designToken.colorPrimary}40`,
                      color: designToken.colorPrimary,
                      margin: 0,
                    }}
                  >
                    Miễn phí
                  </Tag>
                </div>
              </div>

              <Divider style={{ margin: '10px 0' }} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
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

              <Button
                type="primary"
                block
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/checkout')}
                className="btn-cta-pulse"
                style={{ height: 50, fontSize: 16, fontWeight: 700, borderRadius: 10, marginBottom: 14 }}
              >
                Đặt hàng ngay
              </Button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { icon: <CheckCircleFilled />, text: 'Thanh toán khi nhận — an toàn' },
                  { icon: <CarOutlined />,        text: 'Giao tận nơi, miễn phí' },
                  { icon: <SafetyCertificateOutlined />, text: 'Chim tươi sống đảm bảo' },
                  { icon: <PhoneOutlined />,      text: '0978 238 946' },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: designToken.colorPrimary, fontSize: 13, flexShrink: 0 }}>{icon}</span>
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
