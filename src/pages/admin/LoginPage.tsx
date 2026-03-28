import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/authApi';
import { navigateTo } from '../../lib/navigationService';
import type { LoginRequest } from '../../types/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  // If already logged in as admin, redirect to dashboard
  if (token && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onFinish = async (values: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginResponse = await authApi.login(values);
      const userProfile = await authApi.getMe();
      setAuth(loginResponse.access_token, userProfile);
      navigateTo('/admin/dashboard');
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
        background: '#f5f5f5',
      }}
    >
      <Card
        style={{ width: 400, borderRadius: 8 }}
        styles={{ body: { padding: '48px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            Bán Chim Bồ Câu
          </Title>
          <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
            Đăng nhập quản trị
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} disabled={isLoading}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert type="error" message={error} showIcon />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
