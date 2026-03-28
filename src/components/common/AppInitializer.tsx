import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/authStore';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    if (!token) {
      // No token — nothing to validate, finish initializing immediately
      setInitializing(false);
      return;
    }

    // Token exists — validate it and load user profile
    authApi
      .getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        // Token invalid/expired — clear auth so user gets redirected
        clearAuth();
      })
      .finally(() => {
        // CRITICAL: always set initializing to false to prevent permanent loading screen
        setInitializing(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally empty deps — run once on mount only

  return <>{children}</>;
}
