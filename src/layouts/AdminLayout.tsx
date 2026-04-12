import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Drawer, Grid, Layout, Menu, Button, theme, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { setNavigator, navigateTo } from '../lib/navigationService';
import { authApi } from '../api/authApi';
import PigeonLogo from '../components/common/PigeonLogo';

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileDrawerOpen(false);
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

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
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
        style={{ border: 'none', background: 'transparent', marginTop: 8, fontSize: 16 }}
      />

      {/* Logout button — in drawer only on mobile */}
      {isMobile && (
        <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #bbdefb' }}>
          <Button
            block
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            danger
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            Đăng xuất
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <Sider
          width={260}
          style={{
            background: 'linear-gradient(180deg, #e8f0fe 0%, #e3f2fd 100%)',
            borderRight: '1px solid #bbdefb',
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* ── Mobile Slide-in Drawer ── */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          placement="left"
          width={260}
          styles={{
            body: {
              padding: 0,
              background: 'linear-gradient(180deg, #e8f0fe 0%, #e3f2fd 100%)',
            },
            header: { display: 'none' },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout>
        {/* ── Header ── */}
        <Header
          style={{
            background: '#ffffff',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            paddingInline: isMobile ? 12 : 24,
            gap: 10,
            borderBottom: '1px solid #e3f2fd',
            boxShadow: '0 1px 4px rgba(21,101,192,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}
            />
          )}

          {adminName && (
            <span style={{ fontSize: isMobile ? 14 : 15, color: designToken.colorText, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isMobile
                ? <strong style={{ color: '#1565c0' }}>{adminName}</strong>
                : <>Xin chào, <strong style={{ color: '#1565c0' }}>{adminName}</strong></>}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {isMobile ? (
            <Button
              type="text"
              icon={<GlobalOutlined style={{ color: '#1565c0', fontSize: 18 }} />}
              onClick={() => window.open('/', '_blank')}
              style={{ width: 40, height: 40, padding: 0 }}
            />
          ) : (
            <>
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
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                Đăng xuất
              </Button>
            </>
          )}
        </Header>

        {/* ── Page Content ── */}
        <Content
          style={{
            background: designToken.colorBgLayout,
            padding: isMobile ? '12px 12px 72px' : 24,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* ── Mobile Bottom Tab Bar ── */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#fff',
            borderTop: '1px solid #e3f2fd',
            display: 'flex',
            zIndex: 100,
            boxShadow: '0 -2px 8px rgba(21,101,192,0.12)',
          }}
        >
          {menuItems.map((item) => {
            const active = location.pathname === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: 'none',
                  background: active ? '#e8f0fe' : '#fff',
                  cursor: 'pointer',
                  borderTop: `3px solid ${active ? '#1565c0' : 'transparent'}`,
                  padding: '4px 0 6px',
                  transition: 'background 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: 20, color: active ? '#1565c0' : '#9e9e9e', lineHeight: 1 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 10, color: active ? '#1565c0' : '#9e9e9e', fontWeight: active ? 700 : 400 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
