import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAdminCategories, useDeleteCategory } from '../../hooks/admin/useAdminCategories';
import type { AdminCategoryResource } from '../../types/api';
import CategoryFormModal from '../../components/admin/CategoryFormModal';

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<AdminCategoryResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: categories, isLoading, isError } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const handleAddNew = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: AdminCategoryResource) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (category: AdminCategoryResource) => {
    Modal.confirm({
      title: 'Xác nhận xóa đầu mục',
      content: `Bạn có chắc chắn muốn xóa "${category.name}"? Không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteCategory.mutateAsync(category.id),
    });
  };

  const categoryList = categories ?? [];

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
        <Title level={2} style={{ margin: 0, color: '#1b5e20' }}>
          Quản lý đầu mục
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          size="large"
          style={{ fontWeight: 600, fontSize: 16, height: 48 }}
        >
          Thêm đầu mục
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Không tải được danh sách đầu mục"
          description="Đã có lỗi xảy ra. Vui lòng tải lại trang."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && categoryList.length === 0 && (
        <Empty description="Chưa có đầu mục nào" style={{ padding: 60 }}>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew}>
            Thêm đầu mục đầu tiên
          </Button>
        </Empty>
      )}

      {/* Category cards */}
      {!isLoading && categoryList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categoryList.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              allCategories={categoryList}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
      />
    </div>
  );
}

/* ─── Individual category card ─── */

interface CategoryCardProps {
  category: AdminCategoryResource;
  allCategories: AdminCategoryResource[];
  onEdit: (c: AdminCategoryResource) => void;
  onDelete: (c: AdminCategoryResource) => void;
}

function CategoryCard({ category, allCategories, onEdit, onDelete }: CategoryCardProps) {
  const parentName = category.parent_id != null
    ? allCategories.find((c) => c.id === category.parent_id)?.name
    : null;

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}
      styles={{ body: { padding: 16 } }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Info */}
        <Col xs={24} sm={16}>
          <Text strong style={{ fontSize: 18, color: '#1b5e20', display: 'block', marginBottom: 6 }}>
            {category.name}
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
            {parentName && (
              <Tag color="blue" style={{ margin: 0 }}>
                {parentName}
              </Tag>
            )}
            {category.products_count != null && (
              <Text style={{ fontSize: 14, color: '#555' }}>
                {category.products_count} sản phẩm
              </Text>
            )}
            {category.is_active ? (
              <Tag color="green" style={{ fontSize: 13, margin: 0 }}>Hoạt động</Tag>
            ) : (
              <Tag color="red" style={{ fontSize: 13, margin: 0 }}>Ẩn</Tag>
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
                onClick={() => onEdit(category)}
                style={{ height: 44, fontSize: 15, fontWeight: 500 }}
              >
                Sửa
              </Button>
            </Col>
            <Col xs={12} sm={12}>
              <Button
                block
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(category)}
                style={{ height: 44, fontSize: 15, fontWeight: 500 }}
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
