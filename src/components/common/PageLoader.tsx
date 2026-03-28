import { Spin } from 'antd';

export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Spin size="large" tip="Đang tải..." />
    </div>
  );
}
