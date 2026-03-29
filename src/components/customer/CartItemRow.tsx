import { useEffect, useRef } from 'react';
import { List, InputNumber, Button, Typography, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { CartItemResource } from '../../types/api';
import { formatVND } from '../../utils/format';

interface CartItemRowProps {
  item: CartItemResource;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  updating: boolean;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  updating,
}: CartItemRowProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQuantityChange(value: number | null) {
    if (value === null || value < 1) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdateQuantity(item.id, value);
    }, 500);
  }

  return (
    <List.Item
      actions={[
        <Button
          key="remove"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(item.id)}
          disabled={updating}
        >
          Xóa
        </Button>,
      ]}
    >
      <List.Item.Meta
        title={<Typography.Text strong>{item.product_name}</Typography.Text>}
        description={
          <Typography.Text type="secondary">
            {formatVND(item.unit_price)} / con
          </Typography.Text>
        }
      />
      <Space size="large" align="center">
        <InputNumber
          min={1}
          step={1}
          precision={0}
          value={parseInt(item.quantity)}
          onChange={handleQuantityChange}
          disabled={updating}
          style={{ width: 80 }}
        />
        <Typography.Text strong style={{ minWidth: 100, textAlign: 'right', display: 'inline-block' }}>
          {formatVND(item.subtotal)}
        </Typography.Text>
      </Space>
    </List.Item>
  );
}
