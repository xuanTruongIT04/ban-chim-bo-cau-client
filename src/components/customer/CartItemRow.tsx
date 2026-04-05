import { useEffect, useRef } from 'react';
import { List, InputNumber, Button, Typography } from 'antd';
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
    <List.Item style={{ flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
      {/* Product info */}
      <div style={{ flex: '1 1 140px', minWidth: 0 }}>
        <Typography.Text strong style={{ display: 'block', wordBreak: 'break-word' }}>
          {item.product_name}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {formatVND(Number(item.product_price_vnd))} / con
        </Typography.Text>
      </div>

      {/* Quantity + subtotal + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <InputNumber
          min={1}
          step={1}
          precision={0}
          value={parseInt(item.quantity)}
          onChange={handleQuantityChange}
          disabled={updating}
          style={{ width: 72 }}
        />
        <Typography.Text strong style={{ minWidth: 80, textAlign: 'right', display: 'inline-block' }}>
          {formatVND(Number(item.subtotal))}
        </Typography.Text>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(item.id)}
          disabled={updating}
          size="small"
        />
      </div>
    </List.Item>
  );
}
