import { Fragment } from 'react';
import { Alert, Badge, Card, Col, Row, Spin, Statistic, Tag, Typography, theme } from 'antd';
import { Link } from 'react-router-dom';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  WarningOutlined,
  DollarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAdminProducts } from '../../hooks/admin/useAdminProducts';
import { useCompletedOrdersRevenue } from '../../hooks/admin/useAdminOrders';
import { formatVND } from '../../utils/format';

const { Title, Text } = Typography;

const PIPELINE_STEPS = [
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
    bg: '#e3f2fd',
    color: '#1565c0',
    border: '#90caf9',
  },
] as const;

const CANCEL_STEP = {
  key: 'huy' as const,
  label: 'Đã hủy',
  icon: <CloseCircleOutlined />,
  bg: '#ffebee',
  color: '#c62828',
  border: '#ef9a9a',
};

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #e3f2fd 0%, #e8f0fe 50%, #e3f2fd 100%)',
    backgroundSize: '200% 100%',
    animation: 'dash-shimmer 1.4s ease-in-out infinite',
    borderRadius: 8,
  } as const;
  return (
    <>
      <style>{`@keyframes dash-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div>
        <div style={{ ...shimmer, height: 72, borderRadius: 12, marginBottom: 24 }} />
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <Col key={i} xs={24} sm={8}>
              <div style={{ ...shimmer, height: 110, borderRadius: 12 }} />
            </Col>
          ))}
        </Row>
        <div style={{ ...shimmer, height: 22, width: 260, marginBottom: 12 }} />
        <div style={{ ...shimmer, height: 110, borderRadius: 12 }} />
      </div>
    </>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboard();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useAdminProducts({ page: 1, per_page: 9999 });
  const { data: revenue, isLoading: revenueLoading } = useCompletedOrdersRevenue();
  const { token: designToken } = theme.useToken();

  if (dashboardLoading || productsLoading) return <DashboardSkeleton />;

  if (dashboardError || productsError) {
    return (
      <Alert
        type="error"
        message="Không thể tải dữ liệu"
        description={(dashboardError as Error)?.message || (productsError as Error)?.message || 'Vui lòng thử lại'}
        showIcon
      />
    );
  }

  const LOW_STOCK_THRESHOLD = 5;

  const orderStats = dashboardData?.orders_by_status;
  const products = productsData?.data ?? [];
  const inStock = products.filter((p) => parseFloat(p.stock_quantity) > 0).length;
  const outOfStock = products.filter((p) => parseFloat(p.stock_quantity) === 0).length;
  const lowStock = products.filter(
    (p) => parseFloat(p.stock_quantity) > 0 && parseFloat(p.stock_quantity) <= LOW_STOCK_THRESHOLD,
  );
  const totalOrders =
    PIPELINE_STEPS.reduce((sum, s) => sum + (orderStats?.[s.key] ?? 0), 0) +
    (orderStats?.huy ?? 0);

  return (
    <div>
      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="bg-soft-green" style={{ padding: '20px 28px', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#0d47a1' }}>
          Tổng quan — Quý Chim Từ Sơn
        </Title>
        <Text style={{ fontSize: 15, color: '#42a5f5' }}>
          Chào mừng bạn trở lại! Dưới đây là tình hình kinh doanh hôm nay.
        </Text>
      </div>

      {/* ── Row 1 — Big summary cards ──────────────────────────────────── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        {/* Total orders */}
        <Col xs={24} sm={8}>
          <Card style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 12 }}>
            <Statistic
              title={<Text style={{ fontSize: 15, color: '#1565c0' }}>Tổng đơn hàng</Text>}
              value={totalOrders}
              valueStyle={{ color: '#0d47a1', fontSize: 34, fontWeight: 800 }}
              prefix={<ShoppingOutlined style={{ fontSize: 24 }} />}
              suffix={<span style={{ fontSize: 15 }}>đơn</span>}
            />
          </Card>
        </Col>

        {/* Revenue */}
        <Col xs={24} sm={8}>
          <Card style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 12 }}>
            <Text style={{ fontSize: 15, color: '#1565c0', display: 'block', marginBottom: 8 }}>
              Doanh thu
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <DollarOutlined style={{ fontSize: 22, color: '#0d47a1' }} />
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#0d47a1',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {revenueLoading ? <Spin size="small" /> : formatVND(revenue ?? 0)}
              </span>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>Từ đơn hoàn thành</Text>
          </Card>
        </Col>

        {/* Stock */}
        <Col xs={24} sm={8}>
          <Card style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12 }}>
            <Text style={{ fontSize: 15, color: '#795548', display: 'block', marginBottom: 10 }}>
              Kho sản phẩm
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<Text style={{ fontSize: 13, color: '#1565c0' }}>Đang bán</Text>}
                  value={inStock}
                  valueStyle={{ color: '#1565c0', fontSize: 28, fontWeight: 800 }}
                  prefix={<ShoppingOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<Text style={{ fontSize: 13, color: '#c62828' }}>Hết hàng</Text>}
                  value={outOfStock}
                  valueStyle={{ color: '#c62828', fontSize: 28, fontWeight: 800 }}
                  prefix={<WarningOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Order pipeline visualization ───────────────────────────────── */}
      <Title level={4} style={{ marginBottom: 12, color: '#0d47a1' }}>
        Luồng xử lý đơn hàng
      </Title>
      <Card
        style={{
          borderRadius: 12,
          border: `1px solid ${designToken.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 560 }}>
            {/* Main 4 flow steps with arrows */}
            {PIPELINE_STEPS.map((step, idx) => (
              <Fragment key={step.key}>
                <div
                  style={{
                    flex: 1,
                    background: step.bg,
                    borderRight: `1px solid ${step.border}`,
                    padding: '20px 12px',
                    textAlign: 'center',
                    minWidth: 110,
                  }}
                >
                  <div style={{ fontSize: 26, color: step.color, marginBottom: 6 }}>{step.icon}</div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: step.color,
                      lineHeight: 1.1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {orderStats?.[step.key] ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: step.color, marginTop: 6, fontWeight: 600, lineHeight: 1.3 }}>
                    {step.label}
                  </div>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      flexShrink: 0,
                      background: '#fafafa',
                    }}
                  >
                    <RightOutlined style={{ color: '#bdbdbd', fontSize: 14 }} />
                  </div>
                )}
              </Fragment>
            ))}

            {/* Cancelled — off the main flow */}
            <div
              style={{
                width: 120,
                flexShrink: 0,
                background: CANCEL_STEP.bg,
                borderLeft: `2px dashed ${CANCEL_STEP.border}`,
                padding: '20px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#9e9e9e',
                  marginBottom: 8,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Ngoài luồng
              </div>
              <div style={{ fontSize: 26, color: CANCEL_STEP.color, marginBottom: 6 }}>{CANCEL_STEP.icon}</div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: CANCEL_STEP.color,
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {orderStats?.huy ?? 0}
              </div>
              <div style={{ fontSize: 12, color: CANCEL_STEP.color, marginTop: 6, fontWeight: 600 }}>
                {CANCEL_STEP.label}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Low-stock warning ─────────────────────────────────────────────── */}
      {(lowStock.length > 0 || outOfStock > 0) && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Title level={4} style={{ margin: 0, color: '#0d47a1' }}>
              Cảnh báo tồn kho
            </Title>
            <Badge count={lowStock.length + outOfStock} color="#e65100" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products
              .filter((p) => parseFloat(p.stock_quantity) === 0)
              .map((p) => (
                <Card
                  key={`out-${p.id}`}
                  size="small"
                  style={{ borderRadius: 10, border: '1px solid #ef9a9a', background: '#fff5f5' }}
                  styles={{ body: { padding: '10px 16px' } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                      <WarningOutlined style={{ color: '#c62828', fontSize: 16, flexShrink: 0 }} />
                      <Typography.Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <Tag color="error" style={{ margin: 0 }}>Hết hàng</Tag>
                      <Link to="/admin/products">
                        <Typography.Text style={{ fontSize: 12, color: designToken.colorPrimary }}>Nhập thêm →</Typography.Text>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

            {lowStock.map((p) => (
              <Card
                key={`low-${p.id}`}
                size="small"
                style={{ borderRadius: 10, border: '1px solid #ffe082', background: '#fffde7' }}
                styles={{ body: { padding: '10px 16px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <WarningOutlined style={{ color: '#e65100', fontSize: 16, flexShrink: 0 }} />
                    <Typography.Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </Typography.Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Tag color="warning" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      Còn {parseFloat(p.stock_quantity)} {p.unit_type}
                    </Tag>
                    <Link to="/admin/products">
                      <Typography.Text style={{ fontSize: 12, color: designToken.colorPrimary }}>Nhập thêm →</Typography.Text>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
