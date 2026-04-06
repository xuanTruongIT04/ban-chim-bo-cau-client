import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AdminRoute } from '../components/common/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProductsPage from '../pages/admin/ProductsPage';
import OrdersPage from '../pages/admin/OrdersPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import HomePage from '../pages/customer/HomePage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderConfirmationPage from '../pages/customer/OrderConfirmationPage';

const MyOrdersPageLazy = lazy(() => import('../pages/customer/MyOrdersPage'));

const MyOrdersPage = (
  <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin /></div>}>
    <MyOrdersPageLazy />
  </Suspense>
);

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
          { path: '/admin/products', element: <ProductsPage /> },
          { path: '/admin/categories', element: <CategoriesPage /> },
          { path: '/admin/orders', element: <OrdersPage /> },
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
      { path: '/orders', element: MyOrdersPage },
    ],
  },
]);
