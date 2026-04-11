import { Typography, Card, theme } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PolicySectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function PolicySection({ title, icon, children }: PolicySectionProps) {
  const { token: designToken } = theme.useToken();
  return (
    <Card
      style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}`, marginBottom: 20 }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Title level={5} style={{ margin: '0 0 12px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        {title}
      </Title>
      {children}
    </Card>
  );
}

function Item({ check, text }: { check?: boolean; text: string }) {
  const { token: designToken } = theme.useToken();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{
        color: check === false ? '#ff4d4f' : designToken.colorSuccess,
        fontSize: 15,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {check === false ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
      </span>
      <Text style={{ fontSize: 14, lineHeight: 1.65, color: '#444' }}>{text}</Text>
    </div>
  );
}

export default function SalesPolicyPage() {
  const { token: designToken } = theme.useToken();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header-line" style={{ marginBottom: 6 }}>
          <div className="section-header-bar" />
          <Title level={2} style={{ margin: 0 }}>Chính sách bán hàng</Title>
        </div>
        <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
          Cập nhật lần cuối: tháng 4/2026 — Quý Chim · Từ Sơn
        </Text>
      </div>

      <PolicySection title="Sản phẩm & Chất lượng" icon={<CheckCircleOutlined />}>
        <Item text="Chim bồ câu được nuôi tự nhiên, không dùng thuốc tăng trọng hay kháng sinh." />
        <Item text="Chim được kiểm tra sức khỏe trước khi giao — đảm bảo tươi sống, khỏe mạnh." />
        <Item text="Trọng lượng chim tính theo con (mỗi con dao động 350–500g tùy loại)." />
        <Item text="Ảnh sản phẩm trên website là ảnh thực tế — không chỉnh sửa phóng to." />
      </PolicySection>

      <PolicySection title="Đặt hàng & Xác nhận" icon={<InfoCircleOutlined />}>
        <Paragraph style={{ fontSize: 14, color: '#444', marginBottom: 10 }}>
          Sau khi đặt hàng thành công, chúng tôi sẽ liên hệ xác nhận qua điện thoại trong vòng <strong>2 giờ</strong>
          (giờ hành chính). Đơn đặt ngoài giờ hành chính sẽ được xử lý vào sáng hôm sau.
        </Paragraph>
        <Item text="Đơn hàng chỉ được xác nhận sau khi liên hệ điện thoại thành công." />
        <Item text="Có thể hủy đơn miễn phí trước khi đơn được xác nhận." />
        <Item text="Số lượng tối thiểu mỗi đơn: 1 con." />
      </PolicySection>

      <PolicySection title="Đổi trả & Hoàn tiền" icon={<CheckCircleOutlined />}>
        <Paragraph style={{ fontSize: 14, color: '#444', marginBottom: 10 }}>
          Chúng tôi <strong>hỗ trợ đổi trả</strong> trong các trường hợp sau:
        </Paragraph>
        <Item text="Chim bị bệnh, yếu hoặc chết trong vòng 24 giờ sau khi nhận hàng." />
        <Item text="Số lượng giao không đúng so với đơn hàng đã xác nhận." />
        <Item text="Sản phẩm không đúng mô tả trên website." />
        <div style={{ height: 8 }} />
        <Paragraph style={{ fontSize: 14, color: '#444', marginBottom: 10 }}>
          Các trường hợp <strong>không được đổi trả</strong>:
        </Paragraph>
        <Item check={false} text="Chim đã được thả tự do sau khi nhận." />
        <Item check={false} text="Chim bị thương do quá trình vận chuyển phía khách hàng tự xử lý." />
        <Item check={false} text="Khách hàng thay đổi ý định sau khi nhận hàng." />
        <div style={{ height: 8 }} />
        <Text style={{ fontSize: 14, color: '#444' }}>
          Để yêu cầu đổi trả, vui lòng liên hệ <strong>0978 238 946</strong> kèm ảnh/video trong vòng 24 giờ sau khi nhận hàng.
        </Text>
      </PolicySection>

      <PolicySection title="Thanh toán" icon={<InfoCircleOutlined />}>
        <Item text="Thanh toán khi nhận hàng (COD) — Nhận hàng rồi mới trả tiền, hoàn toàn an tâm." />
        <Item text="Chuyển khoản ngân hàng — Thông tin tài khoản được cung cấp sau khi xác nhận đơn." />
        <Item text="Không thu phí thanh toán bằng hình thức nào." />
      </PolicySection>

      <PolicySection title="Giá cả" icon={<InfoCircleOutlined />}>
        <Item text="Giá trên website là giá cuối, đã bao gồm phí vận chuyển nội tỉnh Bắc Ninh." />
        <Item text="Đơn hàng ngoại tỉnh có thể phát sinh phí ship — sẽ báo trước khi xác nhận." />
        <Item text="Giá có thể thay đổi theo mùa vụ, không báo trước. Giá chốt theo thời điểm đặt hàng." />
      </PolicySection>

      {/* CTA */}
      <Card
        style={{ borderRadius: 12, background: designToken.colorPrimaryBg, border: `1px solid ${designToken.colorBorderSecondary}` }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 6, color: designToken.colorPrimary }}>
          Còn thắc mắc?
        </Text>
        <Text style={{ fontSize: 14, color: '#595959', display: 'block', marginBottom: 12 }}>
          Liên hệ trực tiếp để được tư vấn nhanh nhất.
        </Text>
        <a
          href="tel:0978238946"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: designToken.colorPrimary,
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 15,
          }}
        >
          <PhoneOutlined />
          0978 238 946
        </a>
      </Card>
    </div>
  );
}
