import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types/api';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isInitializing: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  setUser: (user: UserProfile) => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isInitializing: true,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      setInitializing: (value) => set({ isInitializing: value }),
    }),
    {
      name: 'auth_token',
      // Persist token + user — backend chưa có /me endpoint nên cần giữ user qua refresh
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
