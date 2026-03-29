import { useState } from 'react';
import { Alert, Button, Image, Modal, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAdminProducts, useDeleteProduct } from '../../hooks/admin/useAdminProducts';
import type { ProductResource } from '../../types/api';
import { formatVND } from '../../utils/format';
import ProductFormModal from '../../components/admin/ProductFormModal';
import ProductImageUpload from '../../components/admin/ProductImageUpload';
import StockAdjustModal from '../../components/admin/StockAdjustModal';

const { Title } = Typography;

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<ProductResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageProductId, setImageProductId] = useState<number | null>(null);
  const [stockProductId, setStockProductId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAdminProducts({ page, per_page: 20 });
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
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteProduct.mutateAsync(product.id),
    });
  };

  const columns: ColumnsType<ProductResource> = [
    {
      title: 'Ảnh',
      dataIndex: 'primary_image',
      key: 'primary_image',
      width: 70,
      render: (url: string | null) =>
        url ? (
          <Image src={url} width={50} height={50} style={{ objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#999',
            }}
          >
            No img
          </div>
        ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price_vnd',
      key: 'price_vnd',
      render: (price: number) => formatVND(price),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (qty: string) => {
        const val = parseFloat(qty);
        return Number.isInteger(val) ? val.toString() : val.toFixed(3);
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Đang bán</Tag>
        ) : (
          <Tag color="red">Ngừng bán</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: ProductResource) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button size="small" onClick={() => setImageProductId(record.id)}>
            Ảnh
          </Button>
          <Button size="small" onClick={() => setStockProductId(record.id)}>
            Tồn kho
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Sản phẩm</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
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

      <Table<ProductResource>
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={
          data?.meta
            ? {
                current: data.meta.current_page,
                pageSize: data.meta.per_page,
                total: data.meta.total,
                onChange: setPage,
                showSizeChanger: false,
              }
            : false
        }
      />

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
