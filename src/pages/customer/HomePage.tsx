import { useState, useMemo } from 'react';
import { Typography, Select, Input, Row, Col, Result, Button } from 'antd';
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/customer/ProductGrid';
import CategoryFilter from '../../components/customer/CategoryFilter';

const { Title, Text } = Typography;

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên A-Z' },
  { value: '-name', label: 'Tên Z-A' },
  { value: '-created_at', label: 'Mới nhất' },
];

// Banner images from bocaulamsan.com (owned by the user)
const BANNER_IMAGE = 'https://bocaulamsan.com/upload/sanpham/27930197732077839828104412587284632307641249n-5799.jpg';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sortField, setSortField] = useState('-created_at');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    per_page: 12,
    'filter[category_id]': categoryId,
    sort: sortField,
  });

  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    return data.data.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.data, searchQuery]);

  function handleCategoryChange(id: number | undefined) {
    setCategoryId(id);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSortField(value);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearFilters() {
    setCategoryId(undefined);
    setSortField('-created_at');
    setSearchQuery('');
    setPage(1);
  }

  if (isError) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Result
          status="error"
          title="Không tải được sản phẩm"
          subTitle="Đã có lỗi xảy ra khi tải danh sách sản phẩm."
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      {/* Hero Banner with real pigeon image */}
      <div className="hero-banner fade-in-up" style={{ marginTop: 20, marginBottom: 28 }}>
        <img
          src={BANNER_IMAGE}
          alt="Chim bồ câu tươi sống - Quý Chim Phú Bình"
        />
        <div className="hero-banner-overlay">
          <Title
            level={1}
            style={{
              color: '#ffffff',
              margin: '0 0 8px',
              fontSize: 34,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            Quý Chim - Phú Bình
          </Title>
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              display: 'block',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              marginBottom: 16,
            }}
          >
            Chim bồ câu tươi sống — Chất lượng hàng đầu — Giao tận nơi
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 8,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <PhoneOutlined style={{ fontSize: 18, color: '#2e7d32' }} />
              <Text style={{ fontSize: 17, fontWeight: 700, color: '#1b5e20' }}>
                0946 477 117
              </Text>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 8,
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 18, color: '#2e7d32' }} />
              <Text style={{ fontSize: 15, fontWeight: 500, color: '#1b5e20' }}>
                Phú Bình, Thái Nguyên
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Section title */}
      <Title level={3} style={{ marginBottom: 16, color: '#1b5e20' }}>
        Danh sách sản phẩm
      </Title>

      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} md={6}>
          <CategoryFilter value={categoryId} onChange={handleCategoryChange} />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            value={sortField}
            options={SORT_OPTIONS}
            onChange={handleSortChange}
            style={{ width: '100%' }}
            size="large"
          />
        </Col>
        <Col xs={24} sm={8} md={12}>
          <Input.Search
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(value) => setSearchQuery(value)}
            allowClear
            size="large"
            style={{ fontSize: 16 }}
          />
        </Col>
      </Row>

      <ProductGrid
        products={filteredProducts}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={handlePageChange}
        onClearFilters={handleClearFilters}
      />

      {/* Footer info */}
      <div
        className="bg-soft-green fade-in-up"
        style={{ padding: '24px', marginTop: 40, marginBottom: 24, textAlign: 'center' }}
      >
        <Title level={4} style={{ color: '#1b5e20', margin: '0 0 8px' }}>
          Quý Chim - Phú Bình
        </Title>
        <Text style={{ fontSize: 16, color: '#555', display: 'block', marginBottom: 4 }}>
          Chuyên cung cấp chim bồ câu tươi sống, chất lượng, uy tín
        </Text>
        <Text style={{ fontSize: 15, color: '#888' }}>
          <PhoneOutlined /> 0946 477 117 &nbsp;|&nbsp; <EnvironmentOutlined /> Phú Bình, Thái Nguyên
        </Text>
      </div>
    </div>
  );
}
