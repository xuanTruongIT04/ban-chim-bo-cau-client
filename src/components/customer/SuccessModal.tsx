import { Modal, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface SuccessModalProps {
  open: boolean;
  type: 'order' | 'cart';
  productName?: string;
  onClose: () => void;
}

export default function SuccessModal({ open, type, productName, onClose }: SuccessModalProps) {
  const navigate = useNavigate();

  const isOrder = type === 'order';

  function handleAction() {
    onClose();
    navigate(isOrder ? '/' : '/cart');
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={380}
      styles={{ body: { textAlign: 'center', padding: '32px 24px 24px' } }}
    >
      {/* Animated bird emoji */}
      <div
        style={{
          fontSize: 72,
          lineHeight: 1,
          marginBottom: 16,
          animation: 'successBounce 0.6s ease',
        }}
      >
        {isOrder ? '🎉' : '🛒'}
      </div>

      <Title level={3} style={{ color: '#0d47a1', margin: '0 0 8px' }}>
        {isOrder ? 'Đặt hàng thành công!' : 'Đã thêm vào giỏ!'}
      </Title>

      <Text style={{ fontSize: 15, color: '#555', display: 'block', marginBottom: 24 }}>
        {isOrder
          ? 'Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất. Cảm ơn bạn đã tin tưởng!'
          : productName
            ? `"${productName}" đã được thêm vào giỏ hàng.`
            : 'Sản phẩm đã được thêm vào giỏ hàng.'}
      </Text>

      <Button
        type="primary"
        size="large"
        block
        onClick={handleAction}
        style={{
          height: 50,
          fontSize: 17,
          fontWeight: 700,
          borderRadius: 10,
          background: '#1565c0',
          border: 'none',
        }}
      >
        {isOrder ? '🏠 Tiếp tục mua sắm' : '🛍️ Xem giỏ hàng & Đặt hàng'}
      </Button>

      <style>{`
        @keyframes successBounce {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </Modal>
  );
}
