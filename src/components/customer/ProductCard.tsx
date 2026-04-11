import { useState } from 'react';
import { Card, Tag, Button, Typography, theme } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAddToCart } from '../../hooks/useCart';
import { formatVND, extractImageUrl } from '../../utils/format';
import type { ProductResource } from '../../types/api';
import SuccessModal from './SuccessModal';

const { Text } = Typography;

interface ProductCardProps {
  product: ProductResource;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const [showModal, setShowModal] = useState(false);
  const { token: designToken } = theme.useToken();

  const stockQty     = parseFloat(product.stock_quantity);
  const isOutOfStock = stockQty === 0;
  const isLowStock   = stockQty > 0 && stockQty <= 5;
  const imageUrl     = extractImageUrl(product.primary_image);

  function handleAddToCart() {
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: () => setShowModal(true) },
    );
  }

  return (
    <>
      <Card
        hoverable
        className="product-card-hover"
        cover={
          <Link to={`/products/${product.id}`} style={{ display: 'block' }}>
            <div className="product-card-image-wrap">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} loading="lazy" />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#bfbfbf',
                    background: '#f5f2ec',
                  }}
                >
                  <span style={{ fontSize: 28 }}>🐦</span>
                  <span style={{ fontSize: 11 }}>Chưa có ảnh</span>
                </div>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="product-card-out-overlay">
                  <Tag
                    style={{
                      fontSize: 12,
                      padding: '3px 12px',
                      fontWeight: 700,
                      border: 'none',
                      background: 'rgba(26,26,26,0.75)',
                      color: '#ffffff',
                    }}
                  >
                    Hết hàng
                  </Tag>
                </div>
              )}

              {/* Low stock badge */}
              {isLowStock && (
                <div style={{ position: 'absolute', top: 6, left: 6 }}>
                  <Tag
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      fontWeight: 600,
                      background: '#fdf3e0',
                      border: '1px solid #f5c97a',
                      color: '#b36a10',
                      borderRadius: 4,
                      margin: 0,
                    }}
                  >
                    Còn {stockQty}
                  </Tag>
                </div>
              )}

              {/* In stock badge */}
              {!isOutOfStock && !isLowStock && (
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <Tag
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      fontWeight: 600,
                      background: 'rgba(25,118,210,0.85)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: 4,
                      margin: 0,
                    }}
                  >
                    Còn hàng
                  </Tag>
                </div>
              )}
            </div>
          </Link>
        }
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          border: `1px solid ${designToken.colorBorderSecondary}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            padding: '10px 12px 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Product name */}
        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <Text
            strong
            style={{
              fontSize: 13,
              color: designToken.colorText,
              marginBottom: 5,
              lineHeight: 1.4,
              /* 2-line clamp */
              overflow: 'hidden',
              display: '-webkit-box' as React.CSSProperties['display'],
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'],
              minHeight: '2.8em',
            } as React.CSSProperties}
          >
            {product.name}
          </Text>
        </Link>

        {/* Price */}
        <div style={{ marginBottom: 10 }}>
          <span className="product-card-price">{formatVND(product.price_vnd)}</span>
          <span className="product-card-unit">/{product.unit_type}</span>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            disabled={isOutOfStock}
            loading={addToCart.isPending}
            onClick={handleAddToCart}
            block
            className={!isOutOfStock ? 'btn-cta-pulse' : ''}
            style={{
              fontWeight: 700,
              fontSize: 13,
              /* min-height 44px — touch target */
              height: 44,
              borderRadius: 8,
              padding: '0 8px',
            }}
          >
            {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
          </Button>

          <Link to={`/products/${product.id}`}>
            <Button
              icon={<EyeOutlined />}
              block
              style={{
                fontSize: 12,
                color: designToken.colorPrimary,
                borderColor: designToken.colorBorderSecondary,
                fontWeight: 500,
                /* min 44px touch target */
                height: 36,
                borderRadius: 8,
              }}
            >
              Chi tiết
            </Button>
          </Link>
        </div>
      </Card>

      <SuccessModal
        open={showModal}
        type="cart"
        productName={product.name}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
