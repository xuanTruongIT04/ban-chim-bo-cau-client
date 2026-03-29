import { useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  DatePicker,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAdminOrders } from '../../hooks/admin/useAdminOrders';
import OrderDetailDrawer from '../../components/admin/OrderDetailDrawer';
import { formatVND } from '../../utils/format';
import type { AdminOrderListParams, OrderResource } from '../../types/api';

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  cho_xac_nhan: 'orange',
  xac_nhan: 'blue',
  dang_giao: 'geekblue',
  hoan_thanh: 'green',
  huy: 'red',
};

const STATUS_OPTIONS = [
  { value: 'cho_xac_nhan', label: 'Chờ xác nhận' },
  { value: 'xac_nhan', label: 'Đã xác nhận' },
  { value: 'dang_giao', label: 'Đang giao' },
  { value: 'hoan_thanh', label: 'Hoàn thành' },
  { value: 'huy', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const [filters, setFilters] = useState<AdminOrderListParams>({
    sort: '-created_at',
    page: 1,
    per_page: 20,
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading } = useAdminOrders(filters);

  const meta = data?.meta;

  const columns: ColumnsType<OrderResource> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 80,
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
      render: (_, record) => formatVND(parseFloat(record.total_amount)),
      width: 140,
    },
    {
      title: 'Trạng thái',
      key: 'order_status',
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.order_status]}>
          {record.order_status_label}
        </Tag>
      ),
      width: 140,
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
        >
          Chi tiết
        </Button>
      ),
      width: 90,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Quản lý đơn hàng
      </Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          options={STATUS_OPTIONS}
          onChange={(v) =>
            setFilters((f) => ({ ...f, 'filter[status]': v, page: 1 }))
          }
        />
        <Input.Search
          placeholder="Tìm theo tên/SĐT"
          style={{ width: 250 }}
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
