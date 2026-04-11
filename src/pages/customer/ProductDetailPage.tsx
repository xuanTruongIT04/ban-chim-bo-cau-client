import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Breadcrumb,
  Row,
  Col,
  Image,
  Tag,
  Button,
  Result,
  Divider,
  App,
  theme,
} from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleFilled,
  MinusOutlined,
  PlusOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useProduct } from '../../hooks/useProduct';
import { useProducts } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCart';
import { formatVND, extractImageUrl, normalizeImageUrl } from '../../utils/format';

const { Title, Text, Paragraph } = Typography;

// Skeleton that matches the actual page layout — prevents layout shift
function ProductDetailSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    borderRadius: 8,
  } as const;

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ ...shimmer, height: 20, width: 240, marginBottom: 24 }} />
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <div style={{ ...shimmer, aspectRatio: '4/3', borderRadius: 16 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...shimmer, width: 72, height: 72, borderRadius: 8, flexShrink: 0 }} />
              ))}
            </div>
          </Col>
          <Col xs={24} md={14}>
            <div style={{ ...shimmer, height: 36, width: '80%', marginBottom: 16 }} />
            <div style={{ ...shimmer, height: 80, borderRadius: 12, marginBottom: 16 }} />
            <div style={{ ...shimmer, height: 20, width: 120, marginBottom: 24 }} />
            <div style={{ ...shimmer, height: 1, marginBottom: 24 }} />
            <div style={{ ...shimmer, height: 16, marginBottom: 8 }} />
            <div style={{ ...shimmer, height: 16, marginBottom: 8 }} />
            <div style={{ ...shimmer, height: 16, width: '60%', marginBottom: 24 }} />
            <div style={{ ...shimmer, height: 1, marginBottom: 24 }} />
            <div style={{ ...shimmer, height: 56, borderRadius: 10, marginBottom: 12 }} />
            <div style={{ ...shimmer, height: 80, borderRadius: 10 }} />
          </Col>
        </Row>
      </div>
    </>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { message } = App.useApp();
  const { token: designToken } = theme.useToken();

  const { data: product, isLoading, isError } = useProduct(productId);
  const addToCart = useAddToCart();

  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Related products — same category, exclude current
  const { data: relatedData } = useProducts({
    page: 1,
    per_page: 4,
    'filter[category_id]': product?.category?.id,
    sort: '-created_at',
  });
  const related = relatedData?.data?.filter((p) => p.id !== productId).slice(0, 4) ?? [];

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <Result
          status="404"
          title="Sản phẩm không tồn tại"
          subTitle="Sản phẩm này đã bị xóa hoặc không còn bán."
          extra={
            <Link to="/">
              <Button type="primary" size="large" icon={<ArrowLeftOutlined />}>
                Quay lại danh sách
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stockQty   = parseFloat(product.stock_quantity);
  const isOutOfStock = stockQty === 0;
  const isLowStock   = stockQty > 0 && stockQty <= 5;
  const images       = (product.images ?? []).map((img) => ({ ...img, url: normalizeImageUrl(img.url) }));
  const activeImage  = images[selectedImageIndex] ?? images[0];

  function increment() { setQty((q) => Math.min(q + 1, isOutOfStock ? 1 : stockQty)); }
  function decrement() { setQty((q) => Math.max(q - 1, 1)); }

  function handleAddToCart() {
    if (!product) return;
    const p = product;
    addToCart.mutate(
      { productId: p.id, quantity: qty },
      {
        onSuccess: () => {
          message.success({
            content: (
              <span>
                Đã thêm <strong>{qty} × {p.name}</strong> vào giỏ hàng!
              </span>
            ),
            duration: 3,
          });
          setQty(1);
        },
      },
    );
  }

  return (
    <div className="fade-in-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 56px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: 14 }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          ...(product.category ? [{ title: product.category.name }] : []),
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]}>
        {/* ── Image Gallery ──────────────────────────────────────────── */}
        <Col xs={24} md={10}>
          <Image.PreviewGroup>
            {/* Main image */}
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: '#f5f2ec',
                marginBottom: 12,
                border: `1px solid ${designToken.colorBorderSecondary}`,
              }}
            >
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={product.name}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'zoom-in',
                  }}
                  preview={{ src: activeImage.url }}
                />
              ) : (
                <div
                  style={{
                    aspectRatio: '4/3',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    color: '#bfbfbf',
                    background: '#f5f2ec',
                  }}
                >
                  <span style={{ fontSize: 48 }}>🐦</span>
                  <span style={{ fontSize: 14 }}>Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      flexShrink: 0,
                      width: 72,
                      height: 72,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2.5px solid ${
                        selectedImageIndex === index
                          ? designToken.colorPrimary
                          : designToken.colorBorderSecondary
                      }`,
                      transition: 'border-color 0.2s',
                      background: '#f5f2ec',
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      preview={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </Image.PreviewGroup>
        </Col>

        {/* ── Product Info ────────────────────────────────────────────── */}
        <Col xs={24} md={14}>
          <Title level={2} style={{ fontSize: 26, marginBottom: 4, lineHeight: 1.3 }}>
            {product.name}
          </Title>

          {/* Category tag */}
          {product.category && (
            <Tag
              style={{
                marginBottom: 16,
                background: designToken.colorPrimary + '14',
                borderColor: designToken.colorPrimary + '40',
                color: designToken.colorPrimary,
                fontWeight: 500,
              }}
            >
              {product.category.name}
            </Tag>
          )}

          {/* Price block */}
          <div
            style={{
              background: '#fdf3e0',
              border: '1px solid #f5c97a',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>
              Giá bán
            </Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: designToken.colorWarning,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {formatVND(product.price_vnd)}
              </span>
              <span style={{ fontSize: 16, color: '#8c8c8c', fontWeight: 400 }}>
                / {product.unit_type}
              </span>
            </div>
          </div>

          {/* Stock status */}
          <div style={{ marginBottom: 16 }}>
            {isOutOfStock ? (
              <Tag
                style={{
                  fontSize: 14,
                  padding: '4px 14px',
                  fontWeight: 600,
                  background: '#f5f5f5',
                  border: '1px solid #d9d9d9',
                  color: '#8c8c8c',
                }}
              >
                Hết hàng
              </Tag>
            ) : isLowStock ? (
              <Tag
                style={{
                  fontSize: 14,
                  padding: '4px 14px',
                  fontWeight: 600,
                  background: '#fdf3e0',
                  border: '1px solid #f5c97a',
                  color: '#b36a10',
                }}
              >
                Sắp hết — Chỉ còn {stockQty} con
              </Tag>
            ) : (
              <Tag
                style={{
                  fontSize: 14,
                  padding: '4px 14px',
                  fontWeight: 600,
                  background: '#e8f0fe',
                  border: `1px solid ${designToken.colorPrimary}40`,
                  color: designToken.colorPrimary,
                }}
              >
                <CheckCircleFilled style={{ marginRight: 5 }} />
                Còn hàng ({stockQty} con)
              </Tag>
            )}
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Description */}
          {product.description && (
            <>
              <Paragraph
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#595959',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 16,
                }}
                ellipsis={{ rows: 4, expandable: true, symbol: 'Xem thêm' }}
              >
                {product.description}
              </Paragraph>
              <Divider style={{ margin: '16px 0' }} />
            </>
          )}

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{ display: 'block', marginBottom: 10, fontSize: 15, color: '#595959' }}
              >
                Số lượng
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <Button
                  icon={<MinusOutlined />}
                  onClick={decrement}
                  disabled={qty <= 1}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px 0 0 8px',
                    border: `1.5px solid ${designToken.colorBorder}`,
                    borderRight: 'none',
                  }}
                />
                <div
                  style={{
                    width: 60,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
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
                <Button
                  icon={<PlusOutlined />}
                  onClick={increment}
                  disabled={qty >= stockQty}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '0 8px 8px 0',
                    border: `1.5px solid ${designToken.colorBorder}`,
                    borderLeft: 'none',
                  }}
                />
                <Text style={{ marginLeft: 14, fontSize: 13, color: '#8c8c8c' }}>
                  Tổng:{' '}
                  <strong style={{ color: designToken.colorWarning }}>
                    {formatVND(Number(product.price_vnd) * qty)}
                  </strong>
                </Text>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            type="primary"
            size="large"
            block
            disabled={isOutOfStock}
            loading={addToCart.isPending}
            onClick={handleAddToCart}
            icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
            className={!isOutOfStock ? 'btn-cta-pulse' : ''}
            style={{
              height: 54,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </Button>

          {/* Trust signals — compact horizontal */}
          <div
            style={{
              background: '#f8faf8',
              border: `1px solid ${designToken.colorBorderSecondary}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {[
              { icon: <CheckCircleFilled />, text: 'Chim tươi sống, cam kết chất lượng' },
              { icon: <CarOutlined />,       text: 'Giao hàng tận nơi — Nhận hàng mới trả tiền' },
              { icon: <SafetyCertificateOutlined />, text: 'Miễn phí vận chuyển nội vùng' },
              { icon: <PhoneOutlined />,     text: 'Hotline hỗ trợ: 0978 238 946' },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: designToken.colorPrimary, fontSize: 14, flexShrink: 0 }}>
                  {icon}
                </span>
                <Text style={{ fontSize: 13, color: '#595959' }}>{text}</Text>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* ── Related Products ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <>
          <Divider style={{ margin: '40px 0 24px' }} />
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div className="section-header-line">
              <div className="section-header-bar" />
              <Title level={4} style={{ margin: 0 }}>Sản phẩm liên quan</Title>
            </div>
          </div>
          <Row gutter={[20, 20]}>
            {related.map((p) => {
              const imgUrl = extractImageUrl(p.primary_image);
              return (
                <Col key={p.id} xs={12} sm={8} md={6}>
                  <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: `1px solid ${designToken.colorBorderSecondary}`,
                        background: '#ffffff',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(25,118,210,0.15)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f5f2ec' }}>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={p.name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 28,
                            }}
                          >
                            🐦
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#1a1a1a',
                            display: 'block',
                            marginBottom: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: designToken.colorWarning }}>
                          {formatVND(p.price_vnd)}
                        </Text>
                      </div>
                    </div>
                  </Link>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}
