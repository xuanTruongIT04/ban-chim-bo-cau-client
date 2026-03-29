import { Row, Col, Pagination, Skeleton, Empty, Button, Card } from 'antd';
import ProductCard from './ProductCard';
import type { ProductResource, PaginationMeta } from '../../types/api';

interface ProductGridProps {
  products: ProductResource[];
  loading: boolean;
  pagination: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export default function ProductGrid({
  products,
  loading,
  pagination,
  onPageChange,
  onClearFilters,
}: ProductGridProps) {
  if (loading) {
    return (
      <>
        <Row gutter={[32, 32]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }

  if (products.length === 0) {
    return (
      <Empty
        description={
          <div>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Không tìm thấy sản phẩm</div>
            <div style={{ color: '#8c8c8c' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</div>
          </div>
        }
        style={{ padding: '48px 0' }}
      >
        <Button onClick={onClearFilters}>Xem tất cả sản phẩm</Button>
      </Empty>
    );
  }

  return (
    <>
      <Row gutter={[32, 32]}>
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {pagination && pagination.total > pagination.per_page && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination
            current={pagination.current_page}
            total={pagination.total}
            pageSize={pagination.per_page}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total) => `Tổng ${total} sản phẩm`}
            align="center"
          />
        </div>
      )}
    </>
  );
}
