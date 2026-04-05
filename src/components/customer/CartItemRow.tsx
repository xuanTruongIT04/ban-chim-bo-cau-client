import { useEffect, useRef } from 'react';
import { List, InputNumber, Button, Typography, Tag } from 'antd';
import { DeleteOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { CartItemResource } from '../../types/api';
import { formatVND, extractImageUrl } from '../../utils/format';

interface CartItemRowProps {
  item: CartItemResource;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  updating: boolean;
}

function CartItemImage({ primaryImage, productName }: { primaryImage: CartItemResource['primary_image']; productName: string }) {
  const imageUrl = extractImageUrl(primaryImage);

  return (
    <div style={{
      width: 80, height: 80, flexShrink: 0,
      borderRadius: 10, overflow: 'hidden',
      background: '#f5f5f5', border: '1px solid #e8e8e8',
    }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={productName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28,
        }}>
          🕊️
        </div>
      )}
    </div>
  );
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

  const qty = parseInt(item.quantity);
  const isHighQty = qty >= 5;

  return (
    <List.Item style={{ padding: '16px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 14, width: '100%', alignItems: 'flex-start' }}>

        <CartItemImage primaryImage={item.primary_image} productName={item.product_name} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <Typography.Text strong style={{ fontSize: 15, wordBreak: 'break-word' }}>
              {item.product_name}
            </Typography.Text>
            {isHighQty && (
              <Tag color="red" style={{ fontSize: 11, padding: '0 6px', fontWeight: 600 }}>
                <FireOutlined /> Mua nhiều tiết kiệm!
              </Tag>
            )}
            {!item.is_available && (
              <Tag color="default" style={{ fontSize: 11 }}>Tạm hết hàng</Tag>
            )}
          </div>

          <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            {formatVND(Number(item.product_price_vnd))} / con
          </Typography.Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <InputNumber
              min={1}
              step={1}
              precision={0}
              value={qty}
              onChange={handleQuantityChange}
              disabled={updating}
              style={{ width: 72 }}
              size="small"
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ThunderboltOutlined style={{ color: '#c62828', fontSize: 13 }} />
              <Typography.Text strong style={{ fontSize: 16, color: '#c62828' }}>
                {formatVND(Number(item.subtotal))}
              </Typography.Text>
            </div>

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(item.id)}
              disabled={updating}
              size="small"
              style={{ marginLeft: 'auto' }}
            />
          </div>
        </div>
      </div>
    </List.Item>
  );
}
