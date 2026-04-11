import { Fragment, useState } from 'react';
import {
  Alert,
  Table,
  Tag,
  Button,
  Input,
  Space,
  DatePicker,
  Typography,
  Card,
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
} from '@ant-design/icons';
import { useAdminOrders } from '../../hooks/admin/useAdminOrders';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import OrderDetailDrawer from '../../components/admin/OrderDetailDrawer';
import { formatVND } from '../../utils/format';
import type { AdminOrderListParams, OrderResource } from '../../types/api';

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
    bg: '#e3f2fd',
    color: '#1565c0',
    border: '#90caf9',
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
              fontSize: 11,
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
      <div style={{ overflowX: 'auto' }}>
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
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      width: 130,
    },
    {
      title: 'Tổng tiền',
      key: 'total_amount',
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#d4880a', fontVariantNumeric: 'tabular-nums' }}>
          {formatVND(parseFloat(record.total_amount))}
        </span>
      ),
      width: 140,
    },
    {
      title: 'Trạng thái',
      key: 'order_status',
      render: (_, record) => (
        <Tag
          color={STATUS_TAG_COLORS[record.order_status]}
          style={{ fontWeight: 600, fontSize: 12 }}
        >
          {record.order_status_label}
        </Tag>
      ),
      width: 150,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_status_label',
      key: 'payment_status_label',
      width: 120,
    },
    {
      title: 'Ngày tạo',
      key: 'created_at',
      render: (_, record) =>
        new Date(record.created_at).toLocaleDateString('vi-VN'),
      width: 110,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedOrderId(record.id)}
          style={{ fontWeight: 600 }}
        >
          Chi tiết
        </Button>
      ),
      width: 90,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16, color: '#0d47a1' }}>
        Quản lý đơn hàng
      </Title>

      {isError && (
        <Alert
          type="error"
          message="Không tải được danh sách đơn hàng"
          description="Đã có lỗi xảy ra. Vui lòng tải lại trang."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── Clickable pipeline ─── click to filter by status ──── */}
      <OrderPipeline
        counts={orderCounts}
        activeStatus={activeStatus}
        onStatusClick={(key) =>
          setFilters((f) => ({ ...f, 'filter[status]': key, page: 1 }))
        }
      />

      {/* ── Search + date filters ─────────────────────────────── */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên / SĐT"
          style={{ width: 240 }}
          allowClear
          onSearch={(v) =>
            setFilters((f) => ({
              ...f,
              'filter[search]': v || undefined,
              page: 1,
            }))
          }
        />
        <DatePicker.RangePicker
          onChange={(_, dateStrings) =>
            setFilters((f) => ({
              ...f,
              'filter[date_from]': dateStrings[0] || undefined,
              'filter[date_to]': dateStrings[1] || undefined,
              page: 1,
            }))
          }
        />
      </Space>

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

      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
