import { useRef } from 'react';
import { App, Button, Modal, Space, Spin, Tag, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useAdminProduct, useDeleteProductImage, ADMIN_PRODUCT_KEY, ADMIN_PRODUCTS_KEY } from '../../hooks/admin/useAdminProducts';
import { adminProductApi } from '../../api/admin/adminProductApi';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeImageUrl } from '../../utils/format';

interface Props {
  productId: number;
  open: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE_MB = 5;

export default function ProductImageUpload({ productId, open, onClose }: Props) {
  const { data: product, isLoading } = useAdminProduct(productId);
  const deleteImage = useDeleteProductImage();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  // Track whether any image change happened while modal was open
  const changedRef = useRef(false);

  const customRequest = async (options: UploadRequestOption) => {
    const file = options.file as File;
    try {
      await adminProductApi.uploadImage(productId, file);
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, productId] });
      changedRef.current = true;
      message.success('Tải ảnh lên thành công');
      options.onSuccess?.({});
    } catch (err) {
      message.error('Không thể tải ảnh lên. Vui lòng thử lại.');
      options.onError?.(err as Error);
    }
  };

  const beforeUpload = (file: File) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isValidType) {
      message.error('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP');
      return Upload.LIST_IGNORE;
    }
    const isUnderLimit = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
    if (!isUnderLimit) {
      message.error(`Ảnh phải nhỏ hơn ${MAX_FILE_SIZE_MB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await adminProductApi.setPrimaryImage(productId, imageId);
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCT_KEY, productId] });
      changedRef.current = true;
      message.success('Đã đặt ảnh đại diện');
    } catch {
      message.error('Không thể đặt ảnh đại diện. Vui lòng thử lại.');
    }
  };

  const handleDeleteImage = (imageId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa ảnh',
      content: 'Bạn có chắc chắn muốn xóa ảnh này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await deleteImage.mutateAsync({ productId, imageId });
        changedRef.current = true;
      },
    });
  };

  const handleClose = () => {
    if (changedRef.current) {
      // Refresh the product list so updated images show in the table
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] });
      changedRef.current = false;
    }
    onClose();
  };

  const images = product?.images ?? [];

  return (
    <Modal
      title="Quản lý ảnh sản phẩm"
      open={open}
      onCancel={handleClose}
      footer={<Button size="large" block onClick={handleClose}>Đóng</Button>}
      width="min(640px, 96vw)"
      destroyOnHidden
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <>
          <Upload.Dragger
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            multiple
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16 }}>Nhấn hoặc kéo ảnh vào đây để tải lên</p>
            <p className="ant-upload-hint">Hỗ trợ JPEG, PNG, WebP — tối đa {MAX_FILE_SIZE_MB}MB</p>
          </Upload.Dragger>

          {images.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    border: img.is_primary ? '2px solid #1565c0' : '1px solid #d9d9d9',
                    borderRadius: 8,
                    padding: 8,
                    textAlign: 'center',
                    width: 140,
                    background: img.is_primary ? '#e8f0fe' : '#fff',
                  }}
                >
                  <img
                    src={normalizeImageUrl(img.url)}
                    alt="product"
                    loading="lazy"
                    style={{ width: '100%', height: 100, objectFit: 'cover', marginBottom: 8, borderRadius: 4 }}
                  />
                  {img.is_primary && (
                    <Tag color="green" style={{ marginBottom: 4, fontSize: 13 }}>Ảnh đại diện</Tag>
                  )}
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {!img.is_primary && (
                      <Button size="small" block onClick={() => handleSetPrimary(img.id)}>
                        Đặt đại diện
                      </Button>
                    )}
                    <Button
                      size="small"
                      danger
                      block
                      onClick={() => handleDeleteImage(img.id)}
                      style={{ opacity: 0.6, fontSize: 11 }}
                    >
                      Xóa ảnh
                    </Button>
                  </Space>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
