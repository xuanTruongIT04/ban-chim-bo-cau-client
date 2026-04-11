import { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  Modal,
  Tag,
  Typography,
  Pagination,
  Empty,
  Card,
  Row,
  Col,
  theme,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PictureOutlined,
  InboxOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAdminProducts, useDeleteProduct } from '../../hooks/admin/useAdminProducts';
import type { ProductResource } from '../../types/api';
import { formatVND, extractImageUrl } from '../../utils/format';
import ProductFormModal from '../../components/admin/ProductFormModal';
import ProductImageUpload from '../../components/admin/ProductImageUpload';
import StockAdjustModal from '../../components/admin/StockAdjustModal';

const { Title, Text } = Typography;

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
function ProductListSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, #e3f2fd 0%, #e8f0fe 50%, #e3f2fd 100%)',
    backgroundSize: '200% 100%',
    animation: 'prod-shimmer 1.4s ease-in-out infinite',
    borderRadius: 8,
  } as const;
  return (
    <>
      <style>{`@keyframes prod-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              border: '1px solid #e0e0e0',
              padding: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              background: '#fff',
            }}
          >
            <div style={{ ...shimmer, width: 100, height: 100, flexShrink: 0, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...shimmer, height: 18, width: '55%', marginBottom: 10 }} />
              <div style={{ ...shimmer, height: 15, width: '35%', marginBottom: 14 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} style={{ ...shimmer, height: 40, width: 80, borderRadius: 8 }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<ProductResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageProductId, setImageProductId] = useState<number | null>(null);
  const [stockProductId, setStockProductId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAdminProducts({ page, per_page: 10 });
  const deleteProduct = useDeleteProduct();

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: ProductResource) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product: ProductResource) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa "${product.name}"? Không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteProduct.mutateAsync(product.id),
    });
  };

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={2} style={{ margin: 0, color: '#0d47a1' }}>
          Quản lý sản phẩm
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          size="large"
          style={{ fontWeight: 600, fontSize: 16, height: 48 }}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Không tải được danh sách sản phẩm"
          description="Đã có lỗi xảy ra. Vui lòng tải lại trang."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading && <ProductListSkeleton />}

      {!isLoading && products.length === 0 && (
        <Empty description="Chưa có sản phẩm nào" style={{ padding: 60 }}>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew}>
            Thêm sản phẩm đầu tiên
          </Button>
        </Empty>
      )}

      {!isLoading && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onManageImages={setImageProductId}
              onManageStock={setStockProductId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {meta && meta.total > meta.per_page && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={meta.current_page}
            total={meta.total}
            pageSize={meta.per_page}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
            showTotal={(total) => (
              <span style={{ fontSize: 15 }}>Tổng {total} sản phẩm</span>
            )}
          />
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingProduct={editingProduct}
      />

      <ProductImageUpload
        productId={imageProductId ?? 0}
        open={imageProductId !== null}
        onClose={() => setImageProductId(null)}
      />

      <StockAdjustModal
        productId={stockProductId}
        open={stockProductId !== null}
        onClose={() => setStockProductId(null)}
      />
    </div>
  );
}

/* ─── Individual product card ─────────────────────────────────────────────── */
interface ProductCardProps {
  product: ProductResource;
  onEdit: (p: ProductResource) => void;
  onManageImages: (id: number) => void;
  onManageStock: (id: number) => void;
  onDelete: (p: ProductResource) => void;
}

function ProductCard({ product, onEdit, onManageImages, onManageStock, onDelete }: ProductCardProps) {
  const { token: designToken } = theme.useToken();
  const imageUrl = extractImageUrl(product.primary_image);
  const stockQty = parseFloat(product.stock_quantity);
  const stockDisplay = Number.isInteger(stockQty) ? stockQty.toString() : stockQty.toFixed(3);
  const isOutOfStock = stockQty === 0;

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${designToken.colorBorderSecondary}`,
        transition: 'box-shadow 0.2s',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Image */}
        <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              width={100}
              height={100}
              style={{ objectFit: 'cover', borderRadius: 10 }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                margin: '0 auto',
                background: '#e8f0fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                color: '#999',
                borderRadius: 10,
                border: '1px dashed #bbdefb',
              }}
            >
              Chưa có ảnh
            </div>
          )}
        </Col>

        {/* Info */}
        <Col xs={24} sm={12}>
          <Text
            strong
            style={{
              fontSize: 17,
              color: '#0d47a1',
              cursor: 'pointer',
              display: 'block',
              marginBottom: 6,
            }}
            onClick={() => onEdit(product)}
          >
            {product.name}
          </Text>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', alignItems: 'center' }}>
            {/* Price — amber/warning color, consistent with storefront */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: designToken.colorWarning,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatVND(product.price_vnd)}
            </Text>

            <Text style={{ fontSize: 14, color: isOutOfStock ? '#c62828' : '#555' }}>
              Kho:{' '}
              <strong style={{ color: isOutOfStock ? '#c62828' : '#0d47a1' }}>
                {stockDisplay}
              </strong>
            </Text>

            {product.is_active ? (
              <Tag color="green" style={{ fontSize: 13, margin: 0 }}>Đang bán</Tag>
            ) : (
              <Tag color="red" style={{ fontSize: 13, margin: 0 }}>Ngừng bán</Tag>
            )}

            {isOutOfStock && (
              <Tag color="warning" style={{ fontSize: 12, margin: 0 }}>Hết hàng</Tag>
            )}
          </div>
        </Col>

        {/* Actions */}
        <Col xs={24} sm={8}>
          <Row gutter={[10, 10]}>
            <Col xs={12} sm={12}>
              <Button
                block
                icon={<EditOutlined />}
                onClick={() => onEdit(product)}
                style={{ height: 44, fontSize: 14, fontWeight: 500 }}
              >
                Sửa
              </Button>
            </Col>
            <Col xs={12} sm={12}>
              <Button
                block
                icon={<PictureOutlined />}
                onClick={() => onManageImages(product.id)}
                style={{ height: 44, fontSize: 14, fontWeight: 500 }}
              >
                Ảnh
              </Button>
            </Col>
            <Col xs={12} sm={12}>
              <Button
                block
                icon={<InboxOutlined />}
                onClick={() => onManageStock(product.id)}
                style={{ height: 44, fontSize: 14, fontWeight: 500 }}
              >
                Kho
              </Button>
            </Col>
            <Col xs={12} sm={12}>
              <Button
                block
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(product)}
                style={{ height: 44, fontSize: 14, fontWeight: 500 }}
              >
                Xóa
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}
