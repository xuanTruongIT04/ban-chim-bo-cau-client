import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/authStore';
import type { UserProfile } from '../../types/api';

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
    axiosInstance
      .get<UserProfile>('/api/me')
      .then((response) => {
        setUser(response.data);
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
