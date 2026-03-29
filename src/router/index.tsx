import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminRoute } from '../components/common/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import PlaceholderPage from '../pages/admin/PlaceholderPage';
import HomePage from '../pages/customer/HomePage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderConfirmationPage from '../pages/customer/OrderConfirmationPage';

export const router = createBrowserRouter([
  // Admin login — public, outside AdminLayout (per D-23)
  {
    path: '/admin/login',
    element: <LoginPage />,
  },

  // Admin routes — protected by AdminRoute (per D-19, D-24)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard', element: <DashboardPage /> },
          { path: '/admin/products', element: <PlaceholderPage title="Sản phẩm" /> },
          { path: '/admin/orders', element: <PlaceholderPage title="Đơn hàng" /> },
        ],
      },
    ],
  },

  // Customer routes — all public (per D-20)
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/orders/confirm', element: <OrderConfirmationPage /> },
      // Phase 4: /orders
    ],
  },
]);
