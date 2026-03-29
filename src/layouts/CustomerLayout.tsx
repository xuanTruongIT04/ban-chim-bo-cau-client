import { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Badge, theme } from 'antd';
import { ShoppingCartOutlined, OrderedListOutlined } from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { setNavigator } from '../lib/navigationService';

const { Header, Content } = Layout;

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const cartCount = cart?.items?.length ?? 0;
  const { token: designToken } = theme.useToken();

  // Register navigation service so axiosInstance interceptors can navigate
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: designToken.colorBgContainer,
          height: 64,
          lineHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: designToken.colorText,
            textDecoration: 'none',
            marginRight: 24,
            whiteSpace: 'nowrap',
          }}
        >
          Bán Chim Bồ Câu
        </Link>

        {/* Category nav — populated in Phase 2 */}
        <Menu
          mode="horizontal"
          items={[]}
          style={{ flex: 1, border: 'none', background: 'transparent' }}
        />

        {/* Order history link */}
        <Link
          to="/orders"
          style={{ color: designToken.colorText, marginRight: 16, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <OrderedListOutlined style={{ fontSize: 18 }} />
          <span style={{ fontSize: 14 }}>Đơn hàng</span>
        </Link>

        {/* Cart icon */}
        <Link to="/cart" style={{ color: designToken.colorText }}>
          <Badge count={cartCount} size="small">
            <ShoppingCartOutlined style={{ fontSize: 20 }} />
          </Badge>
        </Link>
      </Header>

      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
