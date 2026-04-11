import { Row, Col, Pagination, Empty, Button } from 'antd';
import ProductCard from './ProductCard';
import type { ProductResource, PaginationMeta } from '../../types/api';

interface ProductGridProps {
  products: ProductResource[];
  loading: boolean;
  pagination: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

// Skeleton card — matches real card proportions to prevent layout shift
function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #ede8df',
        background: '#ffffff',
      }}
    >
      {/* Image placeholder — 4:3 ratio */}
      <div
        style={{
          aspectRatio: '4 / 3',
          background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Name lines */}
        <div
          style={{
            height: 15,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 15,
            width: '65%',
            borderRadius: 6,
            background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.4s ease-in-out 0.1s infinite',
            marginBottom: 14,
          }}
        />
        {/* Price */}
        <div
          style={{
            height: 22,
            width: '50%',
            borderRadius: 6,
            background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.4s ease-in-out 0.15s infinite',
            marginBottom: 14,
          }}
        />
        {/* Button */}
        <div
          style={{
            height: 46,
            borderRadius: 8,
            background: 'linear-gradient(90deg, #ede8df 0%, #f5f2ec 50%, #ede8df 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.4s ease-in-out 0.2s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
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
      <Row gutter={[12, 16]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Col key={i} xs={12} sm={12} md={8} lg={6}>
            <SkeletonCard />
          </Col>
        ))}
      </Row>
    );
  }

  if (products.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: '#1a1a1a' }}>
              Không tìm thấy sản phẩm
            </div>
            <div style={{ color: '#8c8c8c', fontSize: 14 }}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </div>
          </div>
        }
        style={{ padding: '48px 0' }}
      >
        <Button type="primary" size="large" onClick={onClearFilters}>
          Xem tất cả sản phẩm
        </Button>
      </Empty>
    );
  }

  return (
    <>
      <Row gutter={[12, 16]}>
        {products.map((product) => (
          /* xs=12 → 2 columns on all phones (shows more products, less scrolling) */
          <Col key={product.id} xs={12} sm={12} md={8} lg={6}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {pagination && pagination.total > pagination.per_page && (
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Pagination
            current={pagination.current_page}
            total={pagination.total}
            pageSize={pagination.per_page}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total) => (
              <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                {total} sản phẩm
              </span>
            )}
            align="center"
          />
        </div>
      )}
    </>
  );
}
