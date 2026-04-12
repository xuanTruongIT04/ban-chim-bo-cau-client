import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Badge, Dropdown, theme } from 'antd';
import {
  ShoppingCartOutlined,
  OrderedListOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { setNavigator } from '../lib/navigationService';
import PigeonLogo from '../components/common/PigeonLogo';

const { Header, Content } = Layout;

const MAPS_URL =
  'https://www.google.com/maps/place/C%E1%BB%99t+%C4%90%E1%BB%93ng+H%E1%BB%93+-+T%E1%BB%AB+S%C6%A1n/@21.1153053,105.9614437,3a,75y,192.24h,74.9t/data=!3m7!1e1!3m5!1s0d4t2AGqEhHtSos5olAHOA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D15.100612517500025%26panoid%3D0d4t2AGqEhHtSos5olAHOA%26yaw%3D192.24351766425008!7i16384!8i8192!4m6!3m5!1s0x3135070018c61c1b:0x119f7e639d6daf8e!8m2!3d21.1159444!4d105.9559002!16s%2Fg%2F11n9r9s4mp?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D';

const POLICY_ITEMS = [
  { key: 'ban-hang', label: <Link to="/chinh-sach-ban-hang">Chính sách bán hàng</Link> },
  { key: 'van-chuyen', label: <Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link> },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: cart } = useCart();
  const cartCount = cart?.items?.length ?? 0;
  const { token: designToken } = theme.useToken();

  const isActive = (...paths: string[]) => paths.includes(location.pathname);
  const isPolicyActive = isActive('/chinh-sach-ban-hang', '/chinh-sach-van-chuyen');

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Topbar — desktop only (hidden on mobile via CSS) */}
      <div className="customer-topbar">
        <a href="tel:0978238946">
          <PhoneOutlined />
          0978 238 946
        </a>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.75, textDecoration: 'none', color: 'inherit' }}
        >
          <EnvironmentOutlined />
          Từ Sơn, Bắc Ninh
        </a>
      </div>

      <Header
        className="customer-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 60,
          lineHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 16,
          gap: 8,
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
          <PigeonLogo size={30} color={designToken.colorPrimary} />
          <span
            style={{
              fontSize: 'clamp(14px, 4vw, 17px)',
              fontWeight: 800,
              color: designToken.colorPrimary,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            <span className="logo-full">Quý Chim · Từ Sơn</span>
            <span className="logo-short">Quý Chim</span>
          </span>
        </Link>

        {/* Nav links — desktop only */}
        <nav className="customer-nav-links">
          <Link
            to="/gioi-thieu"
            className={`customer-nav-link${isActive('/gioi-thieu') ? ' active' : ''}`}
          >
            Giới thiệu
          </Link>

          <Dropdown menu={{ items: POLICY_ITEMS }} placement="bottomLeft">
            <span className={`customer-nav-link${isPolicyActive ? ' active' : ''}`}>
              Chính sách <DownOutlined style={{ fontSize: 10 }} />
            </span>
          </Dropdown>

          <Link
            to="/lien-he"
            className={`customer-nav-link${isActive('/lien-he') ? ' active' : ''}`}
          >
            Liên hệ
          </Link>
        </nav>

        <div style={{ flex: 1 }} />

        {/* Phone button — mobile only (hidden on desktop via CSS) */}
        <a
          href="tel:0978238946"
          className="mobile-phone-btn"
          aria-label="Gọi 0978 238 946"
        >
          <PhoneOutlined style={{ fontSize: 18 }} />
        </a>

        {/* Order history */}
        <Link
          to="/orders"
          style={{
            color: designToken.colorTextSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            fontWeight: 500,
            padding: '8px 10px',
            borderRadius: 8,
            minHeight: 44,
            textDecoration: 'none',
          }}
        >
          <OrderedListOutlined style={{ fontSize: 20 }} />
          <span className="nav-text">Đơn hàng</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            fontWeight: 600,
            padding: '8px 12px',
            minHeight: 44,
            borderRadius: 8,
            background: cartCount > 0 ? '#e8f0fe' : 'transparent',
            color: designToken.colorPrimary,
            border: cartCount > 0 ? '1.5px solid #bbdefb' : '1.5px solid transparent',
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}
        >
          <Badge
            count={cartCount}
            size="small"
            color={designToken.colorPrimary}
            offset={[2, -2]}
          >
            <ShoppingCartOutlined style={{ fontSize: 22 }} />
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
