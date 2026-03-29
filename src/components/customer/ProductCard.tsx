import { Card, Tag, Button, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAddToCart } from '../../hooks/useCart';
import { formatVND } from '../../utils/format';
import type { ProductResource } from '../../types/api';

const { Text } = Typography;

interface ProductCardProps {
  product: ProductResource;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const isOutOfStock = product.stock_quantity === 0;

  const coverImage = (
    <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f5f5f5' }}>
      {product.primary_image ? (
        <img
          src={product.primary_image.thumbnail_url}
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
            color: '#bfbfbf',
          }}
        >
          Không có ảnh
        </div>
      )}
      {isOutOfStock && (
        <Tag
          color="error"
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          Hết hàng
        </Tag>
      )}
    </div>
  );

  return (
    <Card
      hoverable
      cover={coverImage}
      actions={[
        <Button
          key="add-to-cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={isOutOfStock}
          loading={addToCart.isPending}
          onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
        >
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>,
        <Link key="view-detail" to={`/products/${product.id}`}>
          Xem chi tiết
        </Link>,
      ]}
    >
      <Card.Meta
        title={product.name}
        description={
          <Text style={{ color: '#1677ff', fontWeight: 500 }}>
            {formatVND(product.price_vnd)} / {product.unit_type}
          </Text>
        }
      />
    </Card>
  );
}
