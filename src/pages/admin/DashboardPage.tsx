import { Alert, Badge, Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useCompletedOrdersRevenue } from '../../hooks/admin/useAdminOrders';
import { formatVND } from '../../utils/format';

const { Title } = Typography;

const ORDER_STATUS_CONFIG = [
  { key: 'cho_xac_nhan' as const, label: 'Chờ xác nhận', color: 'orange' },
  { key: 'xac_nhan' as const, label: 'Xác nhận', color: '#1677ff' },
  { key: 'dang_giao' as const, label: 'Đang giao', color: 'geekblue' },
  { key: 'hoan_thanh' as const, label: 'Hoàn thành', color: 'green' },
  { key: 'huy' as const, label: 'Hủy', color: 'red' },
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
        message="Không thể tải dữ liệu dashboard"
        description={(dashboardError as Error)?.message || (productsError as Error)?.message || 'Vui lòng thử lại'}
        showIcon
      />
    );
  }

  const orderStats = dashboardData?.orders_by_status;
  const products = productsData?.data ?? [];
  const inStock = products.filter((p) => parseFloat(p.stock_quantity) > 0).length;
  const outOfStock = products.filter((p) => parseFloat(p.stock_quantity) === 0).length;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Row 1 — Order status cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {ORDER_STATUS_CONFIG.map(({ key, label, color }) => (
          <Col key={key} xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    <Badge color={color} />
                    {' '}{label}
                  </span>
                }
                value={orderStats?.[key] ?? 0}
                valueStyle={{ color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Row 2 — Summary cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Đơn hàng mới" size="small">
            <Statistic
              value={orderStats?.cho_xac_nhan ?? 0}
              valueStyle={{ color: 'orange' }}
              suffix="đơn chờ xác nhận"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card title="Sản phẩm" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Đang bán"
                  value={inStock}
                  valueStyle={{ color: 'green' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Hết hàng"
                  value={outOfStock}
                  valueStyle={{ color: 'red' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card title="Doanh thu" size="small">
            {revenueLoading ? (
              <Spin size="small" />
            ) : (
              <Statistic
                value={formatVND(revenue ?? 0)}
                valueStyle={{ color: '#52c41a', fontSize: 18 }}
                suffix={<span style={{ fontSize: 12, color: '#888' }}>từ đơn hoàn thành</span>}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
