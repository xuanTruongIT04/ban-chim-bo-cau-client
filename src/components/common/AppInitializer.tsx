import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    // Token + user both persisted — if token exists without user, invalid state
    if (token && !user) {
      clearAuth();
    }
    // TODO: Khi backend thêm GET /me, validate token bằng authApi.getMe() ở đây
    setInitializing(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
