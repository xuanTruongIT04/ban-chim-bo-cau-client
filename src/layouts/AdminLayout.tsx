import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { setNavigator, navigateTo } from '../lib/navigationService';
import { authApi } from '../api/authApi';

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/admin/products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
  },
  {
    key: '/admin/orders',
    icon: <OrderedListOutlined />,
    label: 'Đơn hàng',
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = useAuthStore((s) => s.user?.name);
  const { token: designToken } = theme.useToken();

  // Register navigation service so axiosInstance interceptors can navigate
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout(); // POST /auth/logout — invalidate Sanctum token server-side
    } catch {
      // If server logout fails (network error, token already expired), proceed anyway
    }
    useAuthStore.getState().clearAuth();
    navigateTo('/admin/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: designToken.colorBgContainer }}>
        {/* Logo area */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: designToken.colorBgLayout,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Bán Chim Bồ Câu
        </div>

        {/* Navigation menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: designToken.colorBgContainer,
            height: 64,
            lineHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingInline: 24,
            gap: 8,
          }}
        >
          {adminName && (
            <span style={{ fontSize: 14, color: designToken.colorText }}>
              {adminName}
            </span>
          )}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
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
