import { Typography, Row, Col, Card, theme } from 'antd';
import {
  SafetyCertificateOutlined,
  CarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const MAPS_URL =
  'https://www.google.com/maps/place/C%E1%BB%99t+%C4%90%E1%BB%93ng+H%E1%BB%93+-+T%E1%BB%AB+S%C6%A1n/@21.1153053,105.9614437,3a,75y,192.24h,74.9t/data=!3m7!1e1!3m5!1s0d4t2AGqEhHtSos5olAHOA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D15.100612517500025%26panoid%3D0d4t2AGqEhHtSos5olAHOA%26yaw%3D192.24351766425008!7i16384!8i8192!4m6!3m5!1s0x3135070018c61c1b:0x119f7e639d6daf8e!8m2!3d21.1159444!4d105.9559002!16s%2Fg%2F11n9r9s4mp?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D';

const VALUES = [
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 28 }} />,
    title: 'Chất lượng đảm bảo',
    desc: 'Chim bồ câu được nuôi tự nhiên, ăn lúa gạo, không dùng tăng trọng hay chất kích thích.',
  },
  {
    icon: <CarOutlined style={{ fontSize: 28 }} />,
    title: 'Giao hàng tận nơi',
    desc: 'Giao tận nhà toàn khu vực Bắc Ninh và các tỉnh lân cận. Chim sống khỏe mạnh khi nhận.',
  },
  {
    icon: <StarOutlined style={{ fontSize: 28 }} />,
    title: 'Giá cả minh bạch',
    desc: 'Giá niêm yết rõ ràng, không phụ thu ẩn. Khách nhận hàng — ưng thì trả tiền.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 28 }} />,
    title: 'Hơn 10 năm kinh nghiệm',
    desc: 'Gia đình nuôi chim bồ câu từ năm 2013, cung cấp cho nhà hàng, gia đình và người nuôi.',
  },
];

export default function AboutPage() {
  const { token: designToken } = theme.useToken();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 64px' }}>

      {/* Hero section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${designToken.colorPrimaryBg} 0%, #f5f2ec 100%)`,
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
          marginBottom: 40,
          border: `1px solid ${designToken.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          🕊️
        </div>
        <Title level={1} style={{ margin: '0 0 10px', color: designToken.colorPrimary, fontSize: 'clamp(24px, 5vw, 36px)' }}>
          Quý Chim · Từ Sơn
        </Title>
        <Text style={{ fontSize: 17, color: '#595959', display: 'block', maxWidth: 560, margin: '0 auto' }}>
          Trang trại chim bồ câu gia đình ở Từ Sơn, Bắc Ninh — Cung cấp chim tươi sống chất lượng cao từ năm 2013.
        </Text>
      </div>

      {/* Story */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header-line" style={{ marginBottom: 16 }}>
          <div className="section-header-bar" />
          <Title level={3} style={{ margin: 0 }}>Câu chuyện của chúng tôi</Title>
        </div>
        <Card
          style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}` }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#444', marginBottom: 14 }}>
            Xuất phát từ niềm đam mê với chim bồ câu và mong muốn cung cấp thực phẩm sạch cho gia đình, trang trại
            <strong> Quý Chim</strong> được hình thành vào năm 2013 tại thị xã Từ Sơn, Bắc Ninh.
          </Paragraph>
          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#444', marginBottom: 14 }}>
            Chúng tôi nuôi chim theo phương pháp truyền thống — chim được thả vận động tự do, ăn lúa gạo và thức ăn
            tự nhiên, không sử dụng bất kỳ loại thuốc tăng trọng hay chất kích thích nào. Nhờ đó, thịt chim thơm
            ngon, chắc và bổ dưỡng hơn chim công nghiệp.
          </Paragraph>
          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#444', margin: 0 }}>
            Hiện tại, chúng tôi cung cấp chim bồ câu tươi sống cho các nhà hàng, quán ăn, gia đình và người có nhu
            cầu nuôi chim tại Bắc Ninh và các tỉnh lân cận.
          </Paragraph>
        </Card>
      </div>

      {/* Values */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header-line" style={{ marginBottom: 16 }}>
          <div className="section-header-bar" />
          <Title level={3} style={{ margin: 0 }}>Cam kết của chúng tôi</Title>
        </div>
        <Row gutter={[16, 16]}>
          {VALUES.map((v, i) => (
            <Col key={i} xs={24} sm={12}>
              <Card
                style={{
                  borderRadius: 12,
                  border: `1px solid ${designToken.colorBorderSecondary}`,
                  height: '100%',
                }}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ color: designToken.colorPrimary, marginBottom: 10 }}>{v.icon}</div>
                <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 6 }}>{v.title}</Text>
                <Text style={{ fontSize: 14, color: '#595959', lineHeight: 1.6 }}>{v.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Contact info */}
      <Card
        style={{
          borderRadius: 12,
          background: `linear-gradient(135deg, ${designToken.colorPrimary} 0%, ${designToken.colorPrimaryActive ?? designToken.colorPrimary} 100%)`,
          border: 'none',
        }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <Title level={4} style={{ color: '#fff', margin: '0 0 16px' }}>Liên hệ với chúng tôi</Title>
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PhoneOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block' }}>Điện thoại / Zalo</Text>
                <a href="tel:0978238946" style={{ color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
                  0978 238 946
                </a>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EnvironmentOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block' }}>Địa chỉ</Text>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.5)' }}
                >
                  Từ Sơn, Bắc Ninh
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
