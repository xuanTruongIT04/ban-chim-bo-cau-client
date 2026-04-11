import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  GlobalOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { setNavigator, navigateTo } from '../lib/navigationService';
import { authApi } from '../api/authApi';
import PigeonLogo from '../components/common/PigeonLogo';

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined style={{ fontSize: 18 }} />,
    label: 'Tổng quan',
  },
  {
    key: '/admin/products',
    icon: <ShoppingOutlined style={{ fontSize: 18 }} />,
    label: 'Sản phẩm',
  },
  {
    key: '/admin/categories',
    icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
    label: 'Đầu mục',
  },
  {
    key: '/admin/orders',
    icon: <OrderedListOutlined style={{ fontSize: 18 }} />,
    label: 'Đơn hàng',
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = useAuthStore((s) => s.user?.name);
  const { token: designToken } = theme.useToken();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed anyway
    }
    useAuthStore.getState().clearAuth();
    navigateTo('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          background: 'linear-gradient(180deg, #e8f0fe 0%, #e3f2fd 100%)',
          borderRight: '1px solid #bbdefb',
        }}
      >
        {/* Logo area */}
        <div className="admin-logo-area">
          <PigeonLogo size={40} color="#1565c0" />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0d47a1', lineHeight: 1.2 }}>
              Quý Chim - Từ Sơn
            </div>
            <div style={{ fontSize: 12, color: '#42a5f5' }}>Quản trị hệ thống</div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            marginTop: 8,
            fontSize: 16,
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#ffffff',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingInline: 24,
            gap: 12,
            borderBottom: '1px solid #e3f2fd',
            boxShadow: '0 1px 4px rgba(21,101,192,0.06)',
          }}
        >
          {adminName && (
            <span style={{ fontSize: 15, color: designToken.colorText, fontWeight: 500 }}>
              Xin chào, <strong style={{ color: '#1565c0' }}>{adminName}</strong>
            </span>
          )}

          <div style={{ flex: 1 }} />

          <Tooltip title="Xem trang bán hàng (mở tab mới)">
            <Button
              type="default"
              icon={<GlobalOutlined />}
              onClick={() => window.open('/', '_blank')}
              style={{ borderColor: '#1565c0', color: '#1565c0', fontWeight: 600 }}
            >
              Trang bán hàng
            </Button>
          </Tooltip>

          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
          >
            Đăng xuất
          </Button>
        </Header>

        <Content
          style={{
            background: designToken.colorBgLayout,
            padding: 24,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
