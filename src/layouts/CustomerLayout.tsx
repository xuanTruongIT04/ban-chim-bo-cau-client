import { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Badge, theme } from 'antd';
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
          paddingInline: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          gap: 8,
        }}
      >
        {/* Logo — shorter text keeps it within 360px */}
        <Link
          to="/"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: designToken.colorText,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <span className="logo-full">Bán Chim Bồ Câu</span>
          <span className="logo-short">BCB Câu</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Order history link — icon only on xs, icon+text on sm+ */}
        <Link
          to="/orders"
          style={{ color: designToken.colorText, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        >
          <OrderedListOutlined style={{ fontSize: 18 }} />
          <span className="nav-text">Đơn hàng</span>
        </Link>

        {/* Cart icon */}
        <Link to="/cart" style={{ color: designToken.colorText, flexShrink: 0 }}>
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
