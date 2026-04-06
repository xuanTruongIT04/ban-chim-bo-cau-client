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
          background: 'linear-gradient(180deg, #f0f7f0 0%, #e8f5e9 100%)',
          borderRight: '1px solid #c8e6c9',
        }}
      >
        {/* Logo area */}
        <div className="admin-logo-area">
          <PigeonLogo size={40} color="#2e7d32" />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1b5e20', lineHeight: 1.2 }}>
              Quý Chim - Phú Bình
            </div>
            <div style={{ fontSize: 12, color: '#4caf50' }}>Quản trị hệ thống</div>
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
            lineHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingInline: 24,
            gap: 12,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Tooltip title="Xem trang bán hàng">
            <Button
              type="default"
              icon={<GlobalOutlined />}
              onClick={() => window.open('/', '_blank')}
              style={{
                borderColor: '#2e7d32',
                color: '#2e7d32',
                fontWeight: 600,
              }}
            >
              Trang bán hàng
            </Button>
          </Tooltip>

          <div style={{ flex: 1 }} />

          {adminName && (
            <span style={{ fontSize: 15, color: designToken.colorText, fontWeight: 500 }}>
              Xin chào, {adminName}
            </span>
          )}
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
