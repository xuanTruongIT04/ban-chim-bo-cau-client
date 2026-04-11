import { Typography, Card, Row, Col, Tag, theme } from 'antd';
import {
  CarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function ShippingPolicyPage() {
  const { token: designToken } = theme.useToken();

  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${designToken.colorBorderSecondary}`,
    marginBottom: 20,
  } as const;

  const bodyStyle = { padding: '20px 24px' } as const;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header-line" style={{ marginBottom: 6 }}>
          <div className="section-header-bar" />
          <Title level={2} style={{ margin: 0 }}>Chính sách vận chuyển</Title>
        </div>
        <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
          Cập nhật lần cuối: tháng 4/2026 — Quý Chim · Từ Sơn
        </Text>
      </div>

      {/* Coverage zones */}
      <Card style={cardStyle} styles={{ body: bodyStyle }}>
        <Title level={5} style={{ margin: '0 0 16px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined />
          Phạm vi giao hàng
        </Title>
        <Row gutter={[12, 12]}>
          {[
            { zone: 'Nội thành Từ Sơn', fee: 'Miễn phí', time: '2–4 giờ', tag: 'green' },
            { zone: 'Toàn tỉnh Bắc Ninh', fee: 'Miễn phí', time: '4–8 giờ', tag: 'green' },
            { zone: 'Hà Nội & lân cận', fee: 'Liên hệ', time: '1 ngày', tag: 'blue' },
            { zone: 'Các tỉnh khác', fee: 'Liên hệ', time: '1–2 ngày', tag: 'orange' },
          ].map((row, i) => (
            <Col key={i} xs={24} sm={12}>
              <div
                style={{
                  background: designToken.colorBgLayout,
                  borderRadius: 8,
                  padding: '12px 14px',
                  border: `1px solid ${designToken.colorBorderSecondary}`,
                }}
              >
                <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>{row.zone}</Text>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag color={row.tag} style={{ margin: 0, fontSize: 12 }}>{row.fee}</Tag>
                  <Tag color="default" style={{ margin: 0, fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {row.time}
                  </Tag>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Shipping process */}
      <Card style={cardStyle} styles={{ body: bodyStyle }}>
        <Title level={5} style={{ margin: '0 0 14px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CarOutlined />
          Quy trình giao hàng
        </Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '01', title: 'Đặt hàng', desc: 'Chọn sản phẩm và đặt hàng trực tuyến.' },
            { step: '02', title: 'Xác nhận', desc: 'Chúng tôi gọi điện xác nhận đơn hàng và thời gian giao dự kiến.' },
            { step: '03', title: 'Chuẩn bị', desc: 'Chim được bắt, đóng gói kỹ lưỡng, đảm bảo sống khỏe khi vận chuyển.' },
            { step: '04', title: 'Giao hàng', desc: 'Giao tận tay theo địa chỉ đã cung cấp. Nhận hàng rồi mới thanh toán.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: designToken.colorPrimary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 2 }}>{s.title}</Text>
                <Text style={{ fontSize: 13, color: '#595959', lineHeight: 1.5 }}>{s.desc}</Text>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Packaging */}
      <Card style={cardStyle} styles={{ body: bodyStyle }}>
        <Title level={5} style={{ margin: '0 0 12px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined />
          Đóng gói & Bảo quản
        </Title>
        <Paragraph style={{ fontSize: 14, lineHeight: 1.7, color: '#444', marginBottom: 10 }}>
          Chim được nhốt trong lồng tre/lồng nhựa có thông gió tốt, đảm bảo sống khỏe trong quá trình vận chuyển.
          Với đơn số lượng lớn (trên 20 con), chúng tôi sử dụng phương tiện chuyên dụng.
        </Paragraph>
        <Paragraph style={{ fontSize: 14, lineHeight: 1.7, color: '#444', margin: 0 }}>
          Khách hàng nhận hàng, kiểm tra đủ số lượng và tình trạng chim trước khi thanh toán.
          Nếu có vấn đề, có thể từ chối nhận ngay tại chỗ.
        </Paragraph>
      </Card>

      {/* Notes */}
      <Card
        style={{ ...cardStyle, marginBottom: 0, background: designToken.colorPrimaryBg }}
        styles={{ body: bodyStyle }}
      >
        <Title level={5} style={{ margin: '0 0 10px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneOutlined />
          Liên hệ đặt lịch giao
        </Title>
        <Paragraph style={{ fontSize: 14, color: '#444', marginBottom: 12 }}>
          Để đặt lịch giao hàng cụ thể hoặc hỏi về phí vận chuyển tỉnh ngoài, vui lòng liên hệ trực tiếp:
        </Paragraph>
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
