import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Select, Input, Row, Col, Result, Button, theme } from 'antd';
import {
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/customer/ProductGrid';
import CategoryFilter from '../../components/customer/CategoryFilter';
import bannerImage from '../../assets/banner.jpg';

const { Title, Text } = Typography;

const BANNER_SRC = import.meta.env.VITE_BANNER_IMAGE_URL || bannerImage;

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Mới nhất' },
  { value: 'name',        label: 'A → Z' },
  { value: '-name',       label: 'Z → A' },
];

const TRUST_ITEMS = [
  { icon: <CarOutlined />,                   title: 'Giao tận nơi',      sub: 'Toàn khu vực Bắc Ninh' },
  { icon: <SafetyCertificateOutlined />,      title: 'Tươi sống đảm bảo', sub: 'Cam kết 100%' },
  { icon: <DollarOutlined />,                 title: 'Thanh toán khi nhận', sub: 'COD an toàn' },
  { icon: <CustomerServiceOutlined />,        title: 'Hỗ trợ 24/7',       sub: '0978 238 946' },
];

export default function HomePage() {
  const [page, setPage]               = useState(1);
  const [categoryId, setCategoryId]   = useState<number | undefined>(undefined);
  const [sortField, setSortField]     = useState('-created_at');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>();
  const { token: designToken }        = theme.useToken();

  // Debounce search input → trigger server-side query after 400ms idle
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    per_page: 12,
    'filter[category_id]': categoryId,
    'filter[name]': searchQuery.trim() || undefined,
    sort: sortField,
  });

  const filteredProducts = data?.data ?? [];
  const hasActiveFilter  = categoryId !== undefined || searchQuery.trim() !== '';
  const productCount     = data?.meta?.total ?? 0;

  function handleCategoryChange(id: number | undefined) {
    setCategoryId(id);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearFilters() {
    setCategoryId(undefined);
    setSortField('-created_at');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px' }}>
        <Result
          status="error"
          title="Không tải được sản phẩm"
          subTitle="Đã có lỗi xảy ra. Vui lòng thử lại."
          extra={
            <Button type="primary" size="large" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px' }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="hero-banner fade-in-up" style={{ marginTop: 12, marginBottom: 14 }}>
        {/* Hero is LCP — eager + high priority, never lazy */}
        {/* fetchpriority=high tells browser to preload this LCP image eagerly */}
        <img src={BANNER_SRC} alt="Quý Chim - Từ Sơn" {...{ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>} />

        <div className="hero-banner-overlay">
          <Title
            level={1}
            style={{
              color: '#ffffff',
              margin: '0 0 6px',
              /* Fluid font: 22px phone → 38px desktop */
              fontSize: 'clamp(20px, 5.5vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              lineHeight: 1.15,
            }}
          >
            Quý Chim · Từ Sơn
          </Title>

          <Text
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 'clamp(13px, 2.5vw, 17px)',
              display: 'block',
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            Chim bồ câu tươi sống — Giao tận nơi — Uy tín
          </Text>

          {/* CTA chips — stacks full-width on small mobile (via .hero-chips CSS) */}
          <div className="hero-chips">
            <a
              href="tel:0978238946"
              style={{
                background: '#ffffff',
                borderRadius: 8,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                minHeight: 44,
              }}
            >
              <PhoneOutlined style={{ fontSize: 17, color: designToken.colorPrimary }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: designToken.colorPrimary }}>
                0978 238 946
              </span>
            </a>
            <div
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 8,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                minHeight: 44,
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.92)' }}>
                Từ Sơn, Bắc Ninh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Strip ─────────────────────────────────────────────────── */}
      <div className="trust-strip fade-in-up" style={{ marginBottom: 16 }}>
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="trust-item">
            <div className="trust-item-icon">{item.icon}</div>
            <div className="trust-item-text">
              <strong>{item.title}</strong>
              <span>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Pills ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <CategoryFilter value={categoryId} onChange={handleCategoryChange} />
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      {/* Mobile: 2 rows (search full-width, sort right)
          Desktop: 1 row (search left, sort right) */}
      <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14} md={16}>
          <Input.Search
            placeholder="Tìm sản phẩm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(v) => { setSearchInput(v); }}
            allowClear
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={10} md={8}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 13,
                color: designToken.colorTextTertiary,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Sắp xếp:
            </Text>
            <Select
              value={sortField}
              options={SORT_OPTIONS}
              onChange={(v) => { setSortField(v); setPage(1); }}
              style={{ flex: 1 }}
            />
          </div>
        </Col>
      </Row>

      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="section-header">
        <div className="section-header-line">
          <div className="section-header-bar" />
          <Title level={4} style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
            {hasActiveFilter ? 'Kết quả' : 'Sản phẩm'}
          </Title>
          {!isLoading && productCount > 0 && (
            <Text style={{ fontSize: 13, color: designToken.colorTextTertiary }}>
              {productCount}
            </Text>
          )}
        </div>

        {hasActiveFilter && (
          <Button
            size="small"
            onClick={handleClearFilters}
            style={{
              fontSize: 13,
              color: designToken.colorPrimary,
              borderColor: designToken.colorBorder,
              minHeight: 32,
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* ── Product Grid ────────────────────────────────────────────────── */}
      <ProductGrid
        products={filteredProducts}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={handlePageChange}
        onClearFilters={handleClearFilters}
      />

      {/* ── Footer Strip ────────────────────────────────────────────────── */}
      <div className="footer-strip fade-in-up">
        <Title level={4} style={{ color: '#ffffff', margin: '0 0 6px', fontWeight: 700 }}>
          Quý Chim · Từ Sơn
        </Title>
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            display: 'block',
            marginBottom: 14,
          }}
        >
          Chuyên cung cấp chim bồ câu tươi sống — Giao hàng tận nơi
        </Text>
        <a
          href="tel:0978238946"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            borderRadius: 8,
            padding: '10px 20px',
            minHeight: 44,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          <PhoneOutlined />
          0978 238 946
        </a>

        {/* Policy links */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 20px',
          }}
        >
          {[
            { to: '/gioi-thieu', label: 'Giới thiệu' },
            { to: '/chinh-sach-ban-hang', label: 'Chính sách bán hàng' },
            { to: '/chinh-sach-van-chuyen', label: 'Chính sách vận chuyển' },
            { to: '/lien-he', label: 'Liên hệ' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 13,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, display: 'block', marginTop: 12 }}>
          © 2025 Quý Chim · Từ Sơn, Bắc Ninh
        </Text>
      </div>
    </div>
  );
}
