import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { router } from './router';
import { AppInitializer } from './components/common/AppInitializer';
import { antdTheme } from './config/antd-theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AppInitializer>
          <RouterProvider router={router} />
        </AppInitializer>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
