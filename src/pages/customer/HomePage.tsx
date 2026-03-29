import { useState, useMemo } from 'react';
import { Typography, Select, Input, Row, Col, Result, Button } from 'antd';
import { useProducts } from '../../hooks/useProducts';
import ProductGrid from '../../components/customer/ProductGrid';
import CategoryFilter from '../../components/customer/CategoryFilter';

const { Title } = Typography;

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên A-Z' },
  { value: '-name', label: 'Tên Z-A' },
  { value: '-created_at', label: 'Mới nhất' },
];

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

  // Client-side search — filters only the current page results (not cross-page)
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
            <Button type="primary" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <Title level={2}>Sản phẩm</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} md={6}>
          <CategoryFilter value={categoryId} onChange={handleCategoryChange} />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            value={sortField}
            options={SORT_OPTIONS}
            onChange={handleSortChange}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={8} md={12}>
          <Input.Search
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(value) => setSearchQuery(value)}
            allowClear
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
    </div>
  );
}
