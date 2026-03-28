import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from './PageLoader';

export function AdminRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) return <PageLoader />;
  if (!token) return <Navigate to="/admin/login" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
