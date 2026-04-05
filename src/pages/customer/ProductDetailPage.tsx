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
  Card,
  message,
} from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined, CheckCircleOutlined, SafetyOutlined } from '@ant-design/icons';
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
        title="Sản phẩm không tồn tại hoặc đã bị xóa."
        extra={
          <Link to="/">
            <Button type="primary" size="large">Quay lại danh sách</Button>
          </Link>
        }
      />
    );
  }

  const stockQty = parseFloat(product.stock_quantity);
  const isOutOfStock = stockQty === 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;
  const images = product.images ?? [];
  const primaryImage = images[selectedImageIndex] ?? images[0];

  function renderStockStatus() {
    const qty = parseFloat(product!.stock_quantity);
    if (qty === 0) {
      return <Tag color="error" style={{ fontSize: 16, padding: '4px 12px' }}>Hết hàng</Tag>;
    }
    if (qty <= 5) {
      return (
        <Tag color="warning" style={{ fontSize: 16, padding: '4px 12px' }}>
          Sắp hết — Chỉ còn {qty} con
        </Tag>
      );
    }
    return (
      <Tag color="success" style={{ fontSize: 16, padding: '4px 12px' }}>
        <CheckCircleOutlined /> Còn hàng ({qty} con)
      </Tag>
    );
  }

  function handleAddToCart() {
    addToCart.mutate(
      { productId: product!.id, quantity: selectedQuantity },
      {
        onSuccess: () => {
          message.success({
            content: (
              <span style={{ fontSize: 16 }}>
                Đã thêm <strong>{selectedQuantity} x {product!.name}</strong> vào giỏ hàng!
              </span>
            ),
            duration: 3,
          });
          setSelectedQuantity(1);
        },
      }
    );
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 48px' }}>
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: 15 }}
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
                  style={{ width: '100%', borderRadius: 12 }}
                  preview={{ src: primaryImage.url }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 320,
                    background: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    color: '#bbb',
                    fontSize: 18,
                  }}
                >
                  Chưa có ảnh
                </div>
              )}
            </div>

            {images.length > 1 && (
              <Row gutter={[8, 8]}>
                {images.map((img, index) => (
                  <Col key={img.id} span={6}>
                    <Image
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '3px solid #2e7d32' : '3px solid transparent',
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
          <Title level={2} style={{ fontSize: 28, marginBottom: 12 }}>{product.name}</Title>

          {/* Price - big and red (Vietnamese style) */}
          <div
            style={{
              background: '#fff5f5',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 16,
              border: '1px solid #ffcdd2',
            }}
          >
            <Text
              style={{ color: '#c62828', fontSize: 32, fontWeight: 700, display: 'block' }}
            >
              {formatVND(product.price_vnd)}
              <span style={{ fontSize: 18, fontWeight: 400, color: '#999' }}>
                {' '}/ {product.unit_type}
              </span>
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            {renderStockStatus()}
          </div>

          {isLowStock && (
            <Card
              size="small"
              style={{ background: '#fff8e1', border: '1px solid #ffe082', marginBottom: 16 }}
            >
              <Text style={{ fontSize: 15, color: '#e65100' }}>
                <ThunderboltOutlined /> Sản phẩm sắp hết — Đặt ngay để không bỏ lỡ!
              </Text>
            </Card>
          )}

          <Divider />

          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 24, fontSize: 16, lineHeight: 1.8 }}>
            {product.description}
          </Paragraph>

          <Divider />

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 17 }}>
                Số lượng:
              </Text>
              <InputNumber
                min={1}
                max={stockQty > 0 ? stockQty : 1}
                step={1}
                precision={0}
                value={selectedQuantity}
                onChange={(val) => setSelectedQuantity(val ?? 1)}
                disabled={isOutOfStock}
                size="large"
                style={{ width: 140, fontSize: 18 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={isOutOfStock}
              loading={addToCart.isPending}
              onClick={handleAddToCart}
              className={!isOutOfStock ? 'btn-cta-pulse' : ''}
              style={{
                height: 56,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 12,
              }}
            >
              {isOutOfStock ? 'Hết hàng' : (
                <>
                  <ShoppingCartOutlined style={{ fontSize: 22 }} /> THÊM VÀO GIỎ HÀNG
                </>
              )}
            </Button>

            {/* Trust signals */}
            <Card
              size="small"
              style={{ background: '#f0f7f0', border: '1px solid #c8e6c9' }}
            >
              <Space direction="vertical" size={8}>
                <Text style={{ color: '#2e7d32', fontSize: 15 }}>
                  <SafetyOutlined /> Chim tươi sống, đảm bảo chất lượng
                </Text>
                <Text style={{ color: '#2e7d32', fontSize: 15 }}>
                  <CheckCircleOutlined /> Giao hàng tận nơi — Nhận hàng mới trả tiền
                </Text>
                <Text style={{ color: '#2e7d32', fontSize: 15 }}>
                  <CheckCircleOutlined /> Hỗ trợ hotline: 0978 238 946
                </Text>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
