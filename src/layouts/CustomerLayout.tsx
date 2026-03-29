import { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Badge, theme } from 'antd';
import { ShoppingCartOutlined, OrderedListOutlined } from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { setNavigator } from '../lib/navigationService';
import PigeonLogo from '../components/common/PigeonLogo';

const { Header, Content } = Layout;

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const cartCount = cart?.items?.length ?? 0;
  const { token: designToken } = theme.useToken();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        className="customer-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 68,
          lineHeight: '68px',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 16,
          gap: 12,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <PigeonLogo size={34} color="#2e7d32" />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1b5e20',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="logo-full">Quý Chim - Phú Bình</span>
            <span className="logo-short">Quý Chim</span>
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Order history */}
        <Link
          to="/orders"
          style={{
            color: '#1b5e20',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <OrderedListOutlined style={{ fontSize: 20 }} />
          <span className="nav-text">Đơn hàng</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          style={{
            color: '#1b5e20',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <Badge count={cartCount} size="small" color="#2e7d32">
            <ShoppingCartOutlined style={{ fontSize: 22, color: '#1b5e20' }} />
          </Badge>
          <span className="nav-text">Giỏ hàng</span>
        </Link>
      </Header>

      <Content style={{ background: designToken.colorBgLayout }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
