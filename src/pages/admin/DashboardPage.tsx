import { Alert, Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  WarningOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useCompletedOrdersRevenue } from '../../hooks/admin/useAdminOrders';
import { formatVND } from '../../utils/format';

const { Title, Text } = Typography;

const ORDER_STATUS_CONFIG = [
  {
    key: 'cho_xac_nhan' as const,
    label: 'Chờ xác nhận',
    icon: <ClockCircleOutlined />,
    bg: '#fff8e1',
    color: '#e65100',
    border: '#ffe082',
  },
  {
    key: 'xac_nhan' as const,
    label: 'Đã xác nhận',
    icon: <CheckCircleOutlined />,
    bg: '#e3f2fd',
    color: '#1565c0',
    border: '#90caf9',
  },
  {
    key: 'dang_giao' as const,
    label: 'Đang giao',
    icon: <CarOutlined />,
    bg: '#e8eaf6',
    color: '#283593',
    border: '#9fa8da',
  },
  {
    key: 'hoan_thanh' as const,
    label: 'Hoàn thành',
    icon: <TrophyOutlined />,
    bg: '#e8f5e9',
    color: '#2e7d32',
    border: '#a5d6a7',
  },
  {
    key: 'huy' as const,
    label: 'Đã hủy',
    icon: <CloseCircleOutlined />,
    bg: '#ffebee',
    color: '#c62828',
    border: '#ef9a9a',
  },
] as const;

export default function DashboardPage() {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboard();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useAdminProducts({ page: 1, per_page: 9999 });
  const { data: revenue, isLoading: revenueLoading } = useCompletedOrdersRevenue();

  const isLoading = dashboardLoading || productsLoading;
  const hasError = dashboardError || productsError;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert
        type="error"
        message="Không thể tải dữ liệu"
        description={(dashboardError as Error)?.message || (productsError as Error)?.message || 'Vui lòng thử lại'}
        showIcon
      />
    );
  }

  const orderStats = dashboardData?.orders_by_status;
  const products = productsData?.data ?? [];
  const inStock = products.filter((p) => parseFloat(p.stock_quantity) > 0).length;
  const outOfStock = products.filter((p) => parseFloat(p.stock_quantity) === 0).length;
  const totalOrders = ORDER_STATUS_CONFIG.reduce((sum, s) => sum + (orderStats?.[s.key] ?? 0), 0);

  return (
    <div>
      {/* Welcome banner */}
      <div
        className="bg-soft-green"
        style={{ padding: '20px 28px', marginBottom: 24 }}
      >
        <Title level={3} style={{ margin: 0, color: '#1b5e20' }}>
          Tổng quan — Quý Chim Từ Sơn
        </Title>
        <Text style={{ fontSize: 15, color: '#4caf50' }}>
          Chào mừng bạn trở lại! Dưới đây là tình hình kinh doanh hôm nay.
        </Text>
      </div>

      {/* Row 1 — Big summary cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
            <Statistic
              title={<Text style={{ fontSize: 16, color: '#2e7d32' }}>Tổng đơn hàng</Text>}
              value={totalOrders}
              valueStyle={{ color: '#1b5e20', fontSize: 36, fontWeight: 700 }}
              prefix={<ShoppingOutlined style={{ fontSize: 28 }} />}
              suffix={<span style={{ fontSize: 16 }}>đơn</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#e3f2fd', border: '1px solid #90caf9' }}>
            {revenueLoading ? (
              <Spin size="small" />
            ) : (
              <Statistic
                title={<Text style={{ fontSize: 16, color: '#1565c0' }}>Doanh thu</Text>}
                value={formatVND(revenue ?? 0)}
                valueStyle={{ color: '#0d47a1', fontSize: 32, fontWeight: 700 }}
                prefix={<DollarOutlined style={{ fontSize: 28 }} />}
              />
            )}
            <Text type="secondary" style={{ fontSize: 13 }}>Từ đơn hoàn thành</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ background: '#fff8e1', border: '1px solid #ffe082' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<Text style={{ fontSize: 14, color: '#2e7d32' }}>Đang bán</Text>}
                  value={inStock}
                  valueStyle={{ color: '#2e7d32', fontSize: 30, fontWeight: 700 }}
                  prefix={<ShoppingOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<Text style={{ fontSize: 14, color: '#c62828' }}>Hết hàng</Text>}
                  value={outOfStock}
                  valueStyle={{ color: '#c62828', fontSize: 30, fontWeight: 700 }}
                  prefix={<WarningOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Row 2 — Order status breakdown */}
      <Title level={4} style={{ marginBottom: 16, color: '#1b5e20' }}>
        Chi tiết đơn hàng theo trạng thái
      </Title>
      <Row gutter={[16, 16]}>
        {ORDER_STATUS_CONFIG.map(({ key, label, icon, bg, color, border }) => (
          <Col key={key} xs={12} sm={8} lg={4}>
            <Card
              size="small"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                textAlign: 'center',
              }}
              styles={{ body: { padding: '16px 12px' } }}
            >
              <div style={{ fontSize: 28, color, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1.2 }}>
                {orderStats?.[key] ?? 0}
              </div>
              <div style={{ fontSize: 14, color, marginTop: 4, fontWeight: 500 }}>
                {label}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
