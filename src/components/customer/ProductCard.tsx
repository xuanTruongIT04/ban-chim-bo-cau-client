import { useState } from 'react';
import { Card, Tag, Button, Typography } from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons';
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
  const isOutOfStock = parseFloat(product.stock_quantity) === 0;
  const stockQty = parseFloat(product.stock_quantity);
  const isLowStock = stockQty > 0 && stockQty <= 5;

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: () => setShowModal(true) },
    );
  };

  const imageUrl = extractImageUrl(product.primary_image);

  const coverImage = (
    <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f5f5f5' }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontSize: 16,
            background: '#fafafa',
          }}
        >
          Chưa có ảnh
        </div>
      )}
      {/* Status badges */}
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isOutOfStock && (
          <Tag color="error" style={{ fontSize: 14, padding: '2px 10px', fontWeight: 600 }}>
            Hết hàng
          </Tag>
        )}
        {isLowStock && (
          <Tag color="warning" style={{ fontSize: 13, padding: '2px 8px', fontWeight: 600 }}>
            Còn {stockQty} con
          </Tag>
        )}
      </div>
      {!isOutOfStock && !isLowStock && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Tag color="#2e7d32" style={{ fontWeight: 600, fontSize: 12 }}>Còn hàng</Tag>
        </div>
      )}
    </div>
  );

  return (
    <>
    <Card
      hoverable
      cover={coverImage}
      className="product-card-hover"
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <Text
          strong
          style={{
            fontSize: 17,
            color: '#333',
            display: 'block',
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Text>
      </Link>

      <Text
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#c62828',
          display: 'block',
          marginBottom: 12,
        }}
      >
        {formatVND(product.price_vnd)}
        <span style={{ fontSize: 14, fontWeight: 400, color: '#999' }}>
          {' '}/ {product.unit_type}
        </span>
      </Text>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button
          type="primary"
          icon={isOutOfStock ? undefined : <ShoppingCartOutlined />}
          disabled={isOutOfStock}
          loading={addToCart.isPending}
          onClick={handleAddToCart}
          size="large"
          block
          className={!isOutOfStock ? 'btn-cta-pulse' : ''}
          style={{
            fontWeight: 700,
            fontSize: 16,
            height: 48,
            borderRadius: 10,
          }}
        >
          {isOutOfStock ? 'Hết hàng' : (
            <>
              <ThunderboltOutlined /> MUA NGAY
            </>
          )}
        </Button>
        <Link to={`/products/${product.id}`} style={{ textAlign: 'center' }}>
          <Button type="link" style={{ fontSize: 15, color: '#2e7d32', fontWeight: 500, padding: 0 }}>
            Xem chi tiết
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
