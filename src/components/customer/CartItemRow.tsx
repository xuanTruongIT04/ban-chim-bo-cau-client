import { useEffect, useRef } from 'react';
import { List, Typography, Tag, theme } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { CartItemResource } from '../../types/api';
import { formatVND, extractImageUrl } from '../../utils/format';

interface CartItemRowProps {
  item: CartItemResource;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  updating: boolean;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove, updating }: CartItemRowProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { token: designToken } = theme.useToken();

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const qty = parseInt(item.quantity);

  function changeQty(newQty: number) {
    if (newQty < 1) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdateQuantity(item.id, newQty), 400);
  }

  const imageUrl = extractImageUrl(item.primary_image);

  return (
    <List.Item
      style={{
        padding: '14px 14px',
        alignItems: 'flex-start',
        opacity: !item.is_available ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        {/* Product image */}
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: 10,
            overflow: 'hidden',
            background: '#f5f2ec',
            border: `1px solid ${designToken.colorBorderSecondary}`,
            alignSelf: 'flex-start',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.product_name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24,
              }}
            >
              🕊️
            </div>
          )}
        </div>

        {/* Info block */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* Row 1: Name + delete */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <Typography.Text
              strong
              style={{
                fontSize: 14,
                lineHeight: 1.4,
                flex: 1,
                overflow: 'hidden',
                display: '-webkit-box' as React.CSSProperties['display'],
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
              } as React.CSSProperties}
            >
              {item.product_name}
            </Typography.Text>

            {/* Delete — 44×44 touch target */}
            <button
              onClick={() => onRemove(item.id)}
              disabled={updating}
              aria-label="Xóa sản phẩm"
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: updating ? 'not-allowed' : 'pointer',
                borderRadius: 8,
                color: '#bfbfbf',
                fontSize: 15,
                transition: 'color 0.2s, background 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#ff4d4f';
                (e.currentTarget as HTMLButtonElement).style.background = '#fff1f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#bfbfbf';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <DeleteOutlined />
            </button>
          </div>

          {/* Row 2: Unit price + availability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography.Text style={{ fontSize: 13, color: '#8c8c8c' }}>
              {formatVND(Number(item.product_price_vnd))}/con
            </Typography.Text>
            {!item.is_available && (
              <Tag style={{ fontSize: 11, margin: 0 }}>Tạm hết</Tag>
            )}
          </div>

          {/* Row 3: Qty stepper + subtotal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {/* +/- stepper */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => changeQty(qty - 1)}
                disabled={updating || qty <= 1}
                style={{
                  width: 40,
                  height: 40,
                  border: `1.5px solid ${designToken.colorBorder}`,
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  background: updating || qty <= 1 ? '#f5f5f5' : '#ffffff',
                  cursor: updating || qty <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: '#595959',
                  padding: 0,
                  transition: 'background 0.15s',
                }}
              >
                <MinusOutlined />
              </button>
              <div
                style={{
                  width: 44,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  border: `1.5px solid ${designToken.colorBorder}`,
                  borderLeft: 'none',
                  borderRight: 'none',
                  background: '#ffffff',
                  userSelect: 'none',
                }}
              >
                {qty}
              </div>
              <button
                onClick={() => changeQty(qty + 1)}
                disabled={updating}
                style={{
                  width: 40,
                  height: 40,
                  border: `1.5px solid ${designToken.colorBorder}`,
                  borderLeft: 'none',
                  borderRadius: '0 8px 8px 0',
                  background: updating ? '#f5f5f5' : '#ffffff',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: '#595959',
                  padding: 0,
                  transition: 'background 0.15s',
                }}
              >
                <PlusOutlined />
              </button>
            </div>

            {/* Subtotal */}
            <Typography.Text
              strong
              style={{
                fontSize: 16,
                color: designToken.colorWarning,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}
            >
              {formatVND(Number(item.subtotal))}
            </Typography.Text>
          </div>
        </div>
      </div>
    </List.Item>
  );
}
