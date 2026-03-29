import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  List,
  Card,
  Button,
  Empty,
  Spin,
  Result,
  theme,
} from 'antd';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import CartItemRow from '../../components/customer/CartItemRow';
import { formatVND } from '../../utils/format';
import type { CartItemResource } from '../../types/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { token: designToken } = theme.useToken();
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
            <Button type="primary" onClick={() => refetch()}>
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
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <Empty
          description={
            <>
              <Typography.Title level={3}>Giỏ hàng trống</Typography.Title>
              <Typography.Text type="secondary">
                Bạn chưa có sản phẩm nào trong giỏ hàng.
              </Typography.Text>
            </>
          }
        >
          <Button type="primary" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </Button>
        </Empty>
      </div>
    );
  }

  const isMutating = updateCartItem.isPending || removeCartItem.isPending;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Typography.Title level={2}>Giỏ hàng</Typography.Title>

      <Row gutter={[24, 24]}>
        {/* Cart items column */}
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
            style={{ background: designToken.colorBgContainer }}
          />
        </Col>

        {/* Order summary column */}
        <Col xs={24} md={8}>
          <Card title="Tóm tắt đơn hàng">
            <div style={{ marginBottom: 12 }}>
              <Typography.Text>{cart.items.length} sản phẩm</Typography.Text>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Typography.Text type="secondary">Tổng cộng:</Typography.Text>
              <br />
              <Typography.Title
                level={3}
                style={{ color: designToken.colorPrimary, margin: 0 }}
              >
                {formatVND(cart.total_amount)}
              </Typography.Title>
            </div>
            <Button
              type="primary"
              block
              size="large"
              disabled={!cart || cart.items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              Tiến hành đặt hàng
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
