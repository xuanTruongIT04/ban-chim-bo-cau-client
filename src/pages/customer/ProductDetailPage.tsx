import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Row,
  Col,
  Image,
  Tag,
  InputNumber,
  Button,
  Spin,
  Result,
  Space,
  Divider,
} from 'antd';
import { useProduct } from '../../hooks/useProduct';
import { useAddToCart } from '../../hooks/useCart';
import { formatVND } from '../../utils/format';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading, isError } = useProduct(productId);
  const addToCart = useAddToCart();

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <Result
        status="404"
        title="Sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng quay lại danh sách sản phẩm."
        extra={
          <Link to="/">
            <Button type="primary">Quay lại danh sách</Button>
          </Link>
        }
      />
    );
  }

  const isOutOfStock = product.stock_quantity === 0;
  const images = product.images ?? [];
  const primaryImage = images[selectedImageIndex] ?? images[0];

  function renderStockStatus() {
    if (product!.stock_quantity === 0) {
      return <Tag color="error">Hết hàng</Tag>;
    }
    if (product!.stock_quantity <= 5) {
      return (
        <Text style={{ color: '#faad14', fontWeight: 500 }}>
          Chỉ còn {product!.stock_quantity} con
        </Text>
      );
    }
    return (
      <Text style={{ color: '#52c41a', fontWeight: 500 }}>
        Còn {product!.stock_quantity} con
      </Text>
    );
  }

  function handleAddToCart() {
    addToCart.mutate(
      { productId: product!.id, quantity: selectedQuantity },
      {
        onSuccess: () => {
          setSelectedQuantity(1);
        },
      }
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          ...(product.category ? [{ title: product.category.name }] : []),
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]}>
        {/* Image section */}
        <Col xs={24} md={10}>
          <Image.PreviewGroup>
            <div style={{ marginBottom: 16 }}>
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={product.name}
                  style={{ width: '100%', borderRadius: 8 }}
                  preview={{ src: primaryImage.url }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 320,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    color: '#bfbfbf',
                  }}
                >
                  Không có ảnh
                </div>
              )}
            </div>

            {images.length > 1 && (
              <Row gutter={[8, 8]}>
                {images.map((img, index) => (
                  <Col key={img.id} span={6}>
                    <Image
                      src={img.thumbnail_url}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '2px solid #1677ff' : '2px solid transparent',
                      }}
                      preview={false}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Image.PreviewGroup>
        </Col>

        {/* Info section */}
        <Col xs={24} md={14}>
          <Title level={2}>{product.name}</Title>

          <Text
            style={{ color: '#1677ff', fontSize: 24, fontWeight: 600, display: 'block', marginBottom: 16 }}
          >
            {formatVND(product.price_vnd)} / {product.unit_type}
          </Text>

          <div style={{ marginBottom: 16 }}>
            {renderStockStatus()}
          </div>

          <Divider />

          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 24 }}>
            {product.description}
          </Paragraph>

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Số lượng:
              </Text>
              <InputNumber
                min={1}
                max={product.stock_quantity > 0 ? product.stock_quantity : 1}
                step={1}
                precision={0}
                value={selectedQuantity}
                onChange={(val) => setSelectedQuantity(val ?? 1)}
                disabled={isOutOfStock}
                style={{ width: 120 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={isOutOfStock}
              loading={addToCart.isPending}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
