import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography, theme } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/authApi';
import PigeonLogo from '../../components/common/PigeonLogo';
import type { LoginRequest } from '../../types/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token: designToken } = theme.useToken();

  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  if (token && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onFinish = async (values: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginResponse = await authApi.login(values);
      setAuth(loginResponse.access_token, {
        id: 0,
        name: 'Admin',
        email: values.email,
        role: 'admin',
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 422) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      } else {
        setError('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f0fe 0%, #e3f2fd 60%, #f5f2ec 100%)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#ffffff',
              border: `3px solid ${designToken.colorPrimary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(21,101,192,0.15)',
            }}
          >
            <PigeonLogo size={44} color="#1565c0" />
          </div>
          <Title level={3} style={{ margin: '0 0 4px', color: '#0d47a1', fontWeight: 800 }}>
            Quý Chim — Từ Sơn
          </Title>
          <Text style={{ fontSize: 14, color: '#42a5f5' }}>
            Hệ thống quản trị
          </Text>
        </div>

        {/* Login card */}
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid ${designToken.colorPrimary}28`,
            boxShadow: '0 8px 32px rgba(21,101,192,0.10)',
          }}
          styles={{ body: { padding: '32px 28px 28px' } }}
        >
          <Form layout="vertical" onFinish={onFinish} disabled={isLoading} autoComplete="off">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9e9e9e' }} />}
                placeholder="admin@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              style={{ marginBottom: error ? 12 : 20 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9e9e9e' }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            {error && (
              <Alert
                type="error"
                message={error}
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                size="large"
                style={{ height: 48, fontWeight: 700, fontSize: 16, borderRadius: 10 }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
