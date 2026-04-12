import { Fragment, useState } from 'react';
import {
  Alert,
  Empty,
  Table,
  Tag,
  Button,
  Input,
  Space,
  DatePicker,
  Typography,
  Card,
  Grid,
  theme,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  RightOutlined,
  FilterOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAdminOrders } from '../../hooks/admin/useAdminOrders';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import OrderDetailDrawer from '../../components/admin/OrderDetailDrawer';
import { formatVND } from '../../utils/format';
import type { AdminOrderListParams, OrderResource } from '../../types/api';

const { useBreakpoint } = Grid;

const { Title, Text } = Typography;

/* ─── Pipeline data ────────────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  {
    key: 'cho_xac_nhan',
    label: 'Chờ xác nhận',
    icon: <ClockCircleOutlined />,
    bg: '#fff8e1',
    color: '#e65100',
    border: '#ffe082',
  },
  {
    key: 'xac_nhan',
    label: 'Đã xác nhận',
    icon: <CheckCircleOutlined />,
    bg: '#e3f2fd',
    color: '#1565c0',
    border: '#90caf9',
  },
  {
    key: 'dang_giao',
    label: 'Đang giao',
    icon: <CarOutlined />,
    bg: '#e8eaf6',
    color: '#283593',
    border: '#9fa8da',
  },
  {
    key: 'hoan_thanh',
    label: 'Hoàn thành',
    icon: <TrophyOutlined />,
    bg: '#e8f5e9',
    color: '#2e7d32',
    border: '#a5d6a7',
  },
];

const CANCEL_STEP = {
  key: 'huy',
  label: 'Đã hủy',
  icon: <CloseCircleOutlined />,
  bg: '#ffebee',
  color: '#c62828',
  border: '#ef9a9a',
};

const STATUS_TAG_COLORS: Record<string, string> = {
  cho_xac_nhan: 'orange',
  xac_nhan: 'blue',
  dang_giao: 'geekblue',
  hoan_thanh: 'green',
  huy: 'red',
};

/* ─── Clickable pipeline filter ────────────────────────────────────────────── */
interface OrderPipelineProps {
  counts: Record<string, number>;
  activeStatus: string | undefined;
  onStatusClick: (key: string | undefined) => void;
}

function OrderPipeline({ counts, activeStatus, onStatusClick }: OrderPipelineProps) {
  const { token: designToken } = theme.useToken();

  const renderStep = (
    step: typeof PIPELINE_STEPS[number] | typeof CANCEL_STEP,
    isCancel = false,
  ) => {
    const active = activeStatus === step.key;
    return (
      <Tooltip title={active ? 'Nhấn để bỏ lọc' : `Lọc: ${step.label}`} key={step.key}>
        <div
          onClick={() => onStatusClick(active ? undefined : step.key)}
          style={{
            flex: isCancel ? undefined : 1,
            width: isCancel ? 110 : undefined,
            flexShrink: isCancel ? 0 : undefined,
            background: active ? step.color : step.bg,
            borderLeft: isCancel ? `2px dashed ${active ? step.color : step.border}` : undefined,
            borderRight: isCancel ? undefined : `1px solid ${active ? step.color : step.border}`,
            padding: '14px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background 0.18s, box-shadow 0.18s',
            minWidth: isCancel ? undefined : 90,
            boxShadow: active ? `inset 0 -3px 0 rgba(0,0,0,0.15)` : undefined,
          }}
        >
          {isCancel && (
            <div
              style={{
                fontSize: 10,
                color: active ? 'rgba(255,255,255,0.75)' : '#9e9e9e',
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Ngoài luồng
            </div>
          )}
          <div style={{ fontSize: 20, color: active ? '#fff' : step.color, marginBottom: 3 }}>
            {step.icon}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: active ? '#fff' : step.color,
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {counts[step.key] ?? 0}
          </div>
          <div
            style={{
              fontSize: 12,
              color: active ? 'rgba(255,255,255,0.9)' : step.color,
              marginTop: 4,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {step.label}
          </div>
        </div>
      </Tooltip>
    );
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${designToken.colorBorderSecondary}`,
        overflow: 'hidden',
        marginBottom: 20,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ position: 'relative' }}>
        {/* Gradient hint — báo hiệu có thể scroll ngang */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, zIndex: 1,
          background: 'linear-gradient(to left, rgba(255,255,255,0.85), transparent)',
          pointerEvents: 'none',
        }} />
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 520 }}>
          {PIPELINE_STEPS.map((step, idx) => (
            <Fragment key={step.key}>
              {renderStep(step)}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    flexShrink: 0,
                    background: '#fafafa',
                  }}
                >
                  <RightOutlined style={{ color: '#d0d0d0', fontSize: 12 }} />
                </div>
              )}
            </Fragment>
          ))}
          {renderStep(CANCEL_STEP, true)}
        </div>
      </div>
      </div>
      {activeStatus && (
        <div
          style={{
            padding: '6px 14px',
            background: '#f5f5f5',
            borderTop: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FilterOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
          <Text style={{ fontSize: 12, color: '#595959' }}>
            Đang lọc theo trạng thái:{' '}
            <strong>
              {[...PIPELINE_STEPS, CANCEL_STEP].find(s => s.key === activeStatus)?.label}
            </strong>
          </Text>
          <Button
            type="link"
            size="small"
            onClick={() => onStatusClick(undefined)}
            style={{ padding: '0 4px', height: 'auto', fontSize: 12 }}
          >
            Xóa lọc
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ─── Mobile Skeleton ───────────────────────────────────────────────────────── */
function MobileOrderSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #e3f2fd 0%, #e8f0fe 50%, #e3f2fd 100%)',
    backgroundSize: '200% 100%',
    animation: 'order-shimmer 1.4s ease-in-out infinite',
    borderRadius: 6,
  } as const;
  return (
    <>
      <style>{`@keyframes order-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{ borderRadius: 10, border: '1px solid #e3f2fd', padding: '12px 14px', marginBottom: 10, background: '#fff' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ ...shimmer, width: 60, height: 16 }} />
            <div style={{ ...shimmer, width: 80, height: 20, borderRadius: 10 }} />
          </div>
          <div style={{ ...shimmer, width: '55%', height: 16, marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ ...shimmer, width: 100, height: 14 }} />
            <div style={{ ...shimmer, width: 90, height: 44, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ ...shimmer, width: 70, height: 12, marginBottom: 6 }} />
              <div style={{ ...shimmer, width: 100, height: 18 }} />
            </div>
            <div style={{ ...shimmer, width: 80, height: 44, borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ─── Mobile Order Card ─────────────────────────────────────────────────────── */
function OrderCard({ order, onDetail }: { order: OrderResource; onDetail: () => void }) {
  const { token: designToken } = theme.useToken();
  const isPaid = order.payment_status === 'da_thanh_toan';

  return (
    <Card
      size="small"
      style={{ borderRadius: 10, marginBottom: 10, border: '1px solid #e3f2fd' }}
      styles={{ body: { padding: '12px 14px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <strong style={{ fontSize: 15, color: '#0d47a1' }}>#{order.id}</strong>
          {' '}
          <Tag color={STATUS_TAG_COLORS[order.order_status]} style={{ fontWeight: 600, fontSize: 11 }}>
            {order.order_status_label}
          </Tag>
        </div>
        <Tag color={isPaid ? 'success' : 'warning'} style={{ fontSize: 11, margin: 0 }}>
          {order.payment_status_label}
        </Tag>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.customer_name}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: '#595959', fontVariantNumeric: 'tabular-nums' }}>
          {order.customer_phone}
        </span>
        <Button
          icon={<PhoneOutlined />}
          href={`tel:${order.customer_phone}`}
          style={{ height: 44, fontSize: 14, fontWeight: 700, background: '#1565c0', color: '#fff', borderColor: '#1565c0', flex: '0 0 auto' }}
        >
          Gọi ngay
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 12, color: '#9e9e9e', display: 'block' }}>
            {new Date(order.created_at).toLocaleDateString('vi-VN')}
          </span>
          <span style={{ fontWeight: 700, color: '#d4880a', fontVariantNumeric: 'tabular-nums', fontSize: 16 }}>
            {formatVND(parseFloat(order.total_amount))}
          </span>
        </div>
        <Button
          type="primary"
          onClick={onDetail}
          style={{ height: 44, fontWeight: 700, fontSize: 15, background: designToken.colorPrimary, flex: '0 0 auto' }}
        >
          Chi tiết
        </Button>
      </div>
    </Card>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [filters, setFilters] = useState<AdminOrderListParams>({
    sort: '-created_at',
    page: 1,
    per_page: 20,
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAdminOrders(filters);
  const { data: dashboardData } = useAdminDashboard();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const meta = data?.meta;
  const activeStatus = filters['filter[status]'] as string | undefined;
  const orderCounts = (dashboardData?.orders_by_status ?? {}) as Record<string, number>;

  const columns: ColumnsType<OrderResource> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'SĐT',
      key: 'customer_phone',
      render: (_, record) => (
        <Space size={4}>
          <span>{record.customer_phone}</span>
          <Button
            size="small"
            icon={<PhoneOutlined />}
            href={`tel:${record.customer_phone}`}
            style={{ height: 22, fontSize: 11, background: '#1565c0', color: '#fff', borderColor: '#1565c0', padding: '0 6px' }}
          />
        </Space>
      ),
      width: 160,
    },
    {
      title: 'Tổng tiền',
      key: 'total_amount',
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          {formatVND(parseFloat(record.total_amount))}
        </span>
      ),
      width: 130,
    },
    {
      title: 'Trạng thái',
      key: 'order_status',
      render: (_, record) => (
        <Tag color={STATUS_TAG_COLORS[record.order_status]} style={{ fontWeight: 600, fontSize: 12 }}>
          {record.order_status_label}
        </Tag>
      ),
      width: 140,
    },
    {
      title: 'Thanh toán',
      key: 'payment_status',
      render: (_, record) => (
        <Tag color={record.payment_status === 'da_thanh_toan' ? 'success' : 'warning'} style={{ fontSize: 11 }}>
          {record.payment_status_label}
        </Tag>
      ),
      width: 130,
    },
    {
      title: 'Ngày tạo',
      key: 'created_at',
      render: (_, record) => new Date(record.created_at).toLocaleDateString('vi-VN'),
      width: 110,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => setSelectedOrderId(record.id)}
          style={{ fontWeight: 600, height: 30 }}
        >
          Chi tiết
        </Button>
      ),
      width: 80,
    },
  ];

  return (
    <div>
      <Title level={isMobile ? 4 : 3} style={{ marginBottom: 12, color: '#0d47a1' }}>
        Quản lý đơn hàng
      </Title>

      {isError && (
        <Alert
          type="error"
          message="Không tải được danh sách đơn hàng"
          description="Đã có lỗi xảy ra. Vui lòng tải lại trang."
          showIcon
          style={{ marginBottom: 12 }}
        />
      )}

      {/* ── Pipeline filter ── */}
      <OrderPipeline
        counts={orderCounts}
        activeStatus={activeStatus}
        onStatusClick={(key) => setFilters((f) => ({ ...f, 'filter[status]': key, page: 1 }))}
      />

      {/* ── Search + date filters ── */}
      <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Input.Search
          placeholder="Tìm theo tên / SĐT"
          allowClear
          size={isMobile ? 'large' : 'middle'}
          onSearch={(v) => setFilters((f) => ({ ...f, 'filter[search]': v || undefined, page: 1 }))}
          style={{ maxWidth: isMobile ? '100%' : 280 }}
        />
        <DatePicker.RangePicker
          size={isMobile ? 'large' : 'middle'}
          style={{ width: isMobile ? '100%' : 280 }}
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(_, dateStrings) =>
            setFilters((f) => ({
              ...f,
              'filter[date_from]': dateStrings[0] || undefined,
              'filter[date_to]': dateStrings[1] || undefined,
              page: 1,
            }))
          }
        />
      </div>

      {/* ── Mobile: card list / Desktop: table ── */}
      {isMobile ? (
        <>
          {isLoading ? (
            <MobileOrderSkeleton />
          ) : (
            <>
              {(data?.data ?? []).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onDetail={() => setSelectedOrderId(order.id)}
                />
              ))}
              {data?.data?.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={activeStatus ? `Không có đơn "${[...PIPELINE_STEPS, CANCEL_STEP].find(s => s.key === activeStatus)?.label}"` : 'Chưa có đơn hàng nào'}
                  style={{ padding: '32px 0', color: '#9e9e9e' }}
                />
              )}
              {meta && meta.last_page > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 4 }}>
                  <Button
                    size="large"
                    disabled={meta.current_page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                    style={{ height: 44, fontWeight: 600 }}
                  >
                    Trước
                  </Button>
                  <span style={{ fontSize: 14, color: '#595959', fontVariantNumeric: 'tabular-nums' }}>
                    Trang <strong>{meta.current_page}</strong> / {meta.last_page}
                  </span>
                  <Button
                    size="large"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                    style={{ height: 44, fontWeight: 600 }}
                  >
                    Tiếp
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <Table<OrderResource>
          rowKey="id"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isLoading}
          pagination={
            meta
              ? {
                  current: meta.current_page,
                  pageSize: meta.per_page,
                  total: meta.total,
                  showSizeChanger: false,
                  showTotal: (total) => `${total} đơn hàng`,
                  onChange: (p) => setFilters((f) => ({ ...f, page: p })),
                }
              : false
          }
          scroll={{ x: 900 }}
        />
      )}

      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
