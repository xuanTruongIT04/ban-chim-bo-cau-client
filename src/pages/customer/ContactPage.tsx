import { Typography, Card, Row, Col, Form, Input, Button, App, theme } from 'antd';
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  CompassOutlined,
} from '@ant-design/icons';

const MAPS_URL =
  'https://www.google.com/maps/place/C%E1%BB%99t+%C4%90%E1%BB%93ng+H%E1%BB%93+-+T%E1%BB%AB+S%C6%A1n/@21.1153053,105.9614437,3a,75y,192.24h,74.9t/data=!3m7!1e1!3m5!1s0d4t2AGqEhHtSos5olAHOA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D15.100612517500025%26panoid%3D0d4t2AGqEhHtSos5olAHOA%26yaw%3D192.24351766425008!7i16384!8i8192!4m6!3m5!1s0x3135070018c61c1b:0x119f7e639d6daf8e!8m2!3d21.1159444!4d105.9559002!16s%2Fg%2F11n9r9s4mp?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HOURS = [
  { day: 'Thứ 2 – Thứ 6', time: '7:00 – 21:00' },
  { day: 'Thứ 7', time: '7:00 – 20:00' },
  { day: 'Chủ nhật', time: '8:00 – 18:00' },
];

export default function ContactPage() {
  const { token: designToken } = theme.useToken();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  function handleSubmit(values: { name: string; phone: string; content: string }) {
    // In a real app, this would send to an API. For now, show a success message.
    console.info('Contact form submitted:', values);
    message.success('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
    form.resetFields();
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header-line" style={{ marginBottom: 6 }}>
          <div className="section-header-bar" />
          <Title level={2} style={{ margin: 0 }}>Liên hệ</Title>
        </div>
        <Text style={{ fontSize: 15, color: '#595959' }}>
          Hãy liên hệ để được tư vấn và đặt hàng nhanh nhất.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Info column */}
        <Col xs={24} md={10}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Phone */}
            <Card
              style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}` }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: designToken.colorPrimaryBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: designToken.colorPrimary,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  <PhoneOutlined />
                </div>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Điện thoại / Zalo</Text>
                  <a href="tel:0978238946" style={{ fontSize: 18, fontWeight: 700, color: designToken.colorPrimary, textDecoration: 'none' }}>
                    0978 238 946
                  </a>
                  <Text style={{ fontSize: 13, color: '#8c8c8c', display: 'block', marginTop: 2 }}>
                    Gọi hoặc nhắn Zalo đều được
                  </Text>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card
              style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}` }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: designToken.colorPrimaryBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: designToken.colorPrimary,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  <EnvironmentOutlined />
                </div>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Địa chỉ</Text>
                  <Text style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>
                    Thị xã Từ Sơn, tỉnh Bắc Ninh
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8c8c8c', display: 'block', marginTop: 2 }}>
                    Giao hàng tận nơi — không cần đến tận trại
                  </Text>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 13, fontWeight: 600, color: '#1565c0', textDecoration: 'none' }}
                  >
                    <CompassOutlined />
                    Xem trên Google Maps
                  </a>
                </div>
              </div>
            </Card>

            {/* Hours */}
            <Card
              style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}` }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: designToken.colorPrimaryBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: designToken.colorPrimary,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  <ClockCircleOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Giờ tiếp nhận đơn</Text>
                  {HOURS.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: '#595959' }}>{h.day}</Text>
                      <Text style={{ fontSize: 13, fontWeight: 600 }}>{h.time}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Col>

        {/* Contact form */}
        <Col xs={24} md={14}>
          <Card
            style={{ borderRadius: 12, border: `1px solid ${designToken.colorBorderSecondary}` }}
            styles={{ body: { padding: 24 } }}
          >
            <Title level={5} style={{ margin: '0 0 20px', color: designToken.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageOutlined />
              Gửi tin nhắn
            </Title>

            <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên.' }]}
              >
                <Input size="large" placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại.' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại 10 chữ số, bắt đầu bằng 0.' },
                ]}
              >
                <Input size="large" placeholder="0912 345 678" />
              </Form.Item>

              <Form.Item
                label="Nội dung"
                name="content"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung.' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Tôi muốn hỏi về giá chim bồ câu loại..."
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  style={{ height: 48, fontWeight: 700, borderRadius: 8 }}
                >
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>

            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                background: designToken.colorBgLayout,
                borderRadius: 8,
                fontSize: 13,
                color: '#8c8c8c',
                textAlign: 'center',
              }}
            >
              Hoặc gọi ngay <a href="tel:0978238946" style={{ color: designToken.colorPrimary, fontWeight: 700 }}>0978 238 946</a> để được tư vấn nhanh nhất
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
