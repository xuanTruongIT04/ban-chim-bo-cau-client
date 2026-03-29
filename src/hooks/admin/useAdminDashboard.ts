import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '../../api/admin/adminDashboardApi';

export const ADMIN_DASHBOARD_KEY = 'admin-dashboard';

export function useAdminDashboard() {
  return useQuery({
    queryKey: [ADMIN_DASHBOARD_KEY],
    queryFn: () => adminDashboardApi.getStats(),
    staleTime: 60 * 1000,
  });
}
