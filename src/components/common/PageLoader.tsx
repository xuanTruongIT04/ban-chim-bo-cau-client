export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f5f2ec 100%)',
        gap: 16,
      }}
    >
      {/* Pulsing brand logo mark */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#1976d2',
          animation: 'page-loader-pulse 1.4s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 28 }}>🕊️</span>
      </div>
      <span
        style={{
          fontSize: 14,
          color: '#42a5f5',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 500,
        }}
      >
        Đang tải...
      </span>
      <style>{`
        @keyframes page-loader-pulse {
          0%, 100% { transform: scale(1);   opacity: 1;    }
          50%       { transform: scale(1.12); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
