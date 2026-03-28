# Architecture Patterns

**Project:** Ban Chim Bo Cau — React SPA Frontend
**Domain:** E-commerce SPA (React + Vite + TypeScript connecting to Laravel REST API)
**Researched:** 2026-03-28
**Confidence:** HIGH — patterns sourced from stable, well-established React ecosystem conventions

---

## Recommended Architecture

This is a **layered client-side architecture** with strict unidirectional data flow. No server-side rendering. All communication goes through a centralized API service layer.

```
Browser
  └── React Router v6 (routing layer)
        ├── Public Routes  → Pages (no auth required)
        └── Protected Routes → Role Guard → Pages
                                              └── Layouts
                                                    └── Components
                                                          └── Hooks
                                                                └── Services (API)
                                                                      └── Axios Instance
                                                                            └── Laravel REST API
```

**State lives in two places only:**
- **Zustand stores** — global cross-cutting state (auth, cart)
- **Local component state / custom hooks** — page-scoped data fetching and UI state

---

## Folder Structure

```
src/
├── api/                        # API service layer — all HTTP calls
│   ├── axiosInstance.ts        # Configured Axios with interceptors
│   ├── authApi.ts              # login, logout, refresh
│   ├── productApi.ts           # product CRUD, list, search
│   ├── orderApi.ts             # order creation, list, status update
│   └── types/                  # API request/response TypeScript types
│       ├── auth.types.ts
│       ├── product.types.ts
│       └── order.types.ts
│
├── stores/                     # Zustand global state
│   ├── authStore.ts            # user, token, role, login/logout actions
│   └── cartStore.ts            # cart items, add/remove/update, persistence
│
├── hooks/                      # Custom hooks (business logic, data fetching)
│   ├── useAuth.ts              # reads authStore, provides auth helpers
│   ├── useProducts.ts          # fetches product list with filters
│   ├── useProduct.ts           # fetches single product
│   ├── useCart.ts              # cart operations (wraps cartStore)
│   ├── useOrders.ts            # order list (admin or customer-scoped)
│   └── useOrder.ts             # single order detail + status mutation
│
├── components/                 # Reusable UI components (no page logic)
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ProtectedRoute.tsx  # Route guard component
│   │   └── RoleGuard.tsx       # Role-based render guard
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductFilter.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── order/
│       ├── OrderRow.tsx
│       └── OrderStatusBadge.tsx
│
├── layouts/                    # Page shell components (nav, sidebar, footer)
│   ├── CustomerLayout.tsx      # Header + nav + footer for storefront
│   ├── AdminLayout.tsx         # Sidebar + header for admin panel
│   └── AuthLayout.tsx          # Centered layout for login page
│
├── pages/                      # Route-level components (one per route)
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── customer/
│   │   ├── HomePage.tsx
│   │   ├── ProductListPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   └── CheckoutPage.tsx
│   └── admin/
│       ├── DashboardPage.tsx
│       ├── ProductListPage.tsx
│       ├── ProductFormPage.tsx  # create + edit
│       ├── OrderListPage.tsx
│       └── OrderDetailPage.tsx
│
├── router/                     # React Router v6 configuration
│   ├── index.tsx               # createBrowserRouter definition
│   ├── routes.ts               # route path constants
│   └── guards/
│       └── RequireAuth.tsx     # redirects unauthenticated users
│
├── lib/                        # Pure utility functions, no React
│   ├── token.ts                # localStorage get/set/clear for JWT
│   ├── formatters.ts           # currency, date formatters
│   └── validators.ts           # shared form validation rules
│
├── config/                     # Environment-driven configuration
│   └── env.ts                  # typed wrapper around import.meta.env
│
└── App.tsx                     # Root: RouterProvider only
```

---

## Component Boundaries

| Component | Responsibility | Allowed to Call | Must Not |
|-----------|---------------|-----------------|----------|
| `api/*` | HTTP requests to Laravel, return typed data | `axiosInstance` only | Import React, stores, hooks |
| `stores/*` | Global client state, persistence | `api/*` for async actions | Render anything |
| `hooks/*` | Stateful logic, data fetching orchestration | `api/*`, `stores/*` | Render JSX |
| `components/*` | Pure UI rendering | Props, `hooks/*`, `stores/*` | Call `api/*` directly |
| `layouts/*` | Page shell structure | `components/*`, `hooks/useAuth` | Contain business logic |
| `pages/*` | Route endpoint, compose features | `hooks/*`, `components/*`, `layouts/*` | Call `api/*` directly |
| `router/*` | Route definition and guards | `stores/authStore` (role check) | Business logic |
| `lib/*` | Pure functions | Nothing (zero deps) | Import React or stores |

**The critical rule:** Pages never call `api/*` directly. All API access goes through hooks. This is the boundary that enables testing and prevents logic sprawl.

---

## Data Flow

### Authentication Flow

```
LoginPage
  → form submit
  → useAuth.login(credentials)
    → authApi.login(credentials)          [POST /api/auth/login]
      ← { token, user, role }
    → authStore.setAuth(user, token, role)
    → token.ts: localStorage.setItem(token)
  ← redirect based on role
      role === 'admin' → /admin/dashboard
      role === 'customer' → /
```

### Authenticated Request Flow

```
Any Page
  → useProducts() hook
    → productApi.getProducts(filters)
      → axiosInstance.get('/products')
        → Request interceptor attaches: Authorization: Bearer <token>
        ← 200 OK → return data
        ← 401 Unauthorized
          → authStore.clearAuth()
          → redirect to /login
```

### Cart Flow (client-side only, no API for v1)

```
ProductDetailPage
  → useCart().addItem(product, qty)
    → cartStore.addItem(product, qty)
      → Zustand persist middleware → localStorage
  → CartPage reads cartStore directly
  → CheckoutPage sends order: POST /api/orders with cart contents
    → cartStore.clear() on success
```

### Role-Based Route Guard Flow

```
Router loads /admin/dashboard
  → RequireAuth checks authStore.isAuthenticated
      false → navigate('/login', { state: { from } })
      true  → check authStore.role
          role !== 'admin' → navigate('/403') or navigate('/')
          role === 'admin' → render AdminLayout + DashboardPage
```

---

## Key Patterns to Follow

### Pattern 1: Axios Instance with Interceptors

**What:** Single Axios instance shared across all `api/*` modules.

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';
import { getToken, clearToken } from '../lib/token';
import { useAuthStore } from '../stores/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Why:** Centralizes token injection and expiry handling. No page/hook needs to know about auth headers.

### Pattern 2: Zustand Auth Store with Persistence

**What:** Auth state persists to localStorage through Zustand `persist` middleware.

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  role: 'admin' | 'customer' | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, role: 'admin' | 'customer') => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      setAuth: (user, token, role) =>
        set({ user, token, role, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, token: null, role: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Why:** `persist` middleware handles localStorage serialization automatically. Page refreshes restore session without extra code. `isAuthenticated` derived from token presence — no separate flag needed beyond the stored value.

### Pattern 3: ProtectedRoute Component

**What:** Wrapper component used in router config to enforce auth and role.

```typescript
// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  allowedRoles?: Array<'admin' | 'customer'>;
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

**Why:** React Router v6 `<Outlet />` pattern composes cleanly in `createBrowserRouter`. Role check is collocated with auth check — single component to reason about.

### Pattern 4: Router Definition with Role Separation

```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },

  // Customer routes (auth required, any role)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CustomerLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/products', element: <ProductListPage /> },
          { path: '/products/:id', element: <ProductDetailPage /> },
          { path: '/cart', element: <CartPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
        ],
      },
    ],
  },

  // Admin routes (auth required, admin role only)
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <DashboardPage /> },
          { path: '/admin/products', element: <AdminProductListPage /> },
          { path: '/admin/products/new', element: <ProductFormPage /> },
          { path: '/admin/products/:id/edit', element: <ProductFormPage /> },
          { path: '/admin/orders', element: <OrderListPage /> },
          { path: '/admin/orders/:id', element: <OrderDetailPage /> },
        ],
      },
    ],
  },
]);
```

### Pattern 5: API Module Structure

```typescript
// src/api/productApi.ts
import { axiosInstance } from './axiosInstance';
import type { Product, ProductListParams, ProductListResponse } from './types/product.types';

export const productApi = {
  getList: (params: ProductListParams) =>
    axiosInstance.get<ProductListResponse>('/products', { params }).then(r => r.data),

  getById: (id: number) =>
    axiosInstance.get<Product>(`/products/${id}`).then(r => r.data),

  create: (data: Omit<Product, 'id'>) =>
    axiosInstance.post<Product>('/products', data).then(r => r.data),

  update: (id: number, data: Partial<Product>) =>
    axiosInstance.put<Product>(`/products/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    axiosInstance.delete(`/products/${id}`).then(r => r.data),
};
```

**Why:** Plain object (not class) — simpler to tree-shake and mock. Each method returns the data directly (unwraps `.data`). Hooks own error/loading state.

### Pattern 6: Data-Fetching Hook

```typescript
// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import type { ProductListParams, ProductListResponse } from '../api/types/product.types';

export function useProducts(params: ProductListParams) {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi.getList(params)
      .then(res => { if (!cancelled) { setData(res); setError(null); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);   // stringify for stable dep comparison

  return { data, loading, error };
}
```

**Note:** If the project later adopts TanStack Query, hooks like this become trivially thin wrappers. The abstraction layer means pages never change.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: API Calls in Components

**What:** Calling `axiosInstance` or `productApi` directly inside a component body or event handler.

**Why bad:** Logic bleeds into UI. Untestable. Hard to reuse. Loading/error state duplicated across components.

**Instead:** Always go through a custom hook. The hook owns loading, error, and refetch logic.

### Anti-Pattern 2: Fat Page Components

**What:** A single `ProductListPage.tsx` that contains filter state, fetch logic, pagination, modal state, and form handlers — 500+ lines.

**Why bad:** Impossible to test or reuse. Violates single responsibility.

**Instead:** Pages are orchestrators — they compose hooks and components. Target 100 lines or fewer per page. Extract `useProductFilters`, `useProductList`, etc.

### Anti-Pattern 3: Direct localStorage Access Scattered Across Codebase

**What:** Calling `localStorage.getItem('token')` in 10 different files.

**Why bad:** Token key strings duplicated. Can't swap storage strategy. No single point of truth.

**Instead:** All token operations go through `src/lib/token.ts`. Zustand `persist` handles cart/auth automatically.

### Anti-Pattern 4: Untyped API Responses

**What:** Using `any` or `unknown` for API response types, then casting or ignoring type errors.

**Why bad:** TypeScript loses its safety net exactly where bugs are most likely.

**Instead:** Define all request/response types in `src/api/types/`. Even if backend contract is not finalized, write draft types and update them — this surfaces mismatches early.

### Anti-Pattern 5: Inline Role Checks in JSX

**What:** Sprinkling `{user?.role === 'admin' && <Button>Delete</Button>}` across 20 components.

**Why bad:** Role logic is scattered. Hard to audit security surface. Easy to miss one.

**Instead:** Use `ProtectedRoute` for route-level guards. For UI-level conditional rendering, use a `<RoleGuard role="admin">` component that wraps the sensitive element. All role logic is in one composable place.

---

## Suggested Build Order

Dependencies flow from bottom to top. Build lower layers first.

```
Layer 0: Foundation (no deps)
  src/config/env.ts
  src/lib/token.ts
  src/lib/formatters.ts
  src/api/axiosInstance.ts

Layer 1: API Service Layer (depends on Layer 0)
  src/api/types/*.ts
  src/api/authApi.ts
  src/api/productApi.ts
  src/api/orderApi.ts

Layer 2: Global State (depends on Layers 0-1)
  src/stores/authStore.ts
  src/stores/cartStore.ts

Layer 3: Custom Hooks (depends on Layers 1-2)
  src/hooks/useAuth.ts
  src/hooks/useProducts.ts
  src/hooks/useProduct.ts
  src/hooks/useCart.ts
  src/hooks/useOrders.ts
  src/hooks/useOrder.ts

Layer 4: Common Components + Router Guards (depends on Layers 2-3)
  src/components/common/ProtectedRoute.tsx
  src/components/common/LoadingSpinner.tsx
  src/components/common/ErrorMessage.tsx
  src/router/index.tsx (skeleton — pages are stubs)

Layer 5: Layouts (depends on Layer 4)
  src/layouts/AuthLayout.tsx
  src/layouts/CustomerLayout.tsx
  src/layouts/AdminLayout.tsx

Layer 6: Domain Components (depends on Layers 3-5)
  src/components/product/ProductCard.tsx
  src/components/cart/CartItem.tsx
  src/components/order/OrderRow.tsx

Layer 7: Pages (depends on Layers 3-6)
  — Auth: LoginPage
  — Customer: HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage
  — Admin: DashboardPage, ProductListPage, ProductFormPage, OrderListPage, OrderDetailPage
```

**Key dependency constraints:**
- `axiosInstance.ts` must exist before any `*Api.ts` module
- `authStore.ts` must exist before `ProtectedRoute.tsx` (reads auth state for guards)
- `authApi.ts` + `authStore.ts` must exist before any authenticated page can be tested end-to-end
- Cart persistence (cartStore with `persist`) must be validated before CheckoutPage

---

## Scalability Considerations

| Concern | Current Scale (v1) | Future Scale |
|---------|--------------------|--------------|
| Data fetching | Custom hooks with useState/useEffect | Adopt TanStack Query for caching, background refetch, pagination |
| API error handling | Centralized in Axios interceptor | Add typed error codes, toast notification system |
| Cart state | Zustand + localStorage | If multi-device cart needed: sync to backend on change |
| Bundle size | Single chunk (Vite default) | Add React.lazy + Suspense per route group (customer vs admin) |
| Auth token refresh | Re-login on 401 | Add silent refresh with refresh token rotation |
| Form handling | Ant Design Form (built-in) | Already sufficient; no change needed for v1 scope |

---

## Environment Configuration

```typescript
// src/config/env.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

// .env.development
VITE_API_BASE_URL=http://localhost:8000/api

// .env.production
VITE_API_BASE_URL=https://api.banchimbocau.vn/api
```

All `import.meta.env` accesses are centralized here. No component imports env vars directly.

---

## Sources

- React Router v6 official docs — createBrowserRouter, Outlet, nested routes, loader patterns (HIGH confidence — stable API since v6.4)
- Zustand docs — persist middleware, direct store access outside React (getState()) (HIGH confidence — stable API)
- Axios docs — interceptors, request config, instance creation (HIGH confidence — very stable)
- Vite docs — import.meta.env, .env file conventions (HIGH confidence)
- React 18 — useState, useEffect, cleanup pattern (HIGH confidence)
- Community consensus on feature-based vs layer-based folder structure for medium-scale SPAs (MEDIUM confidence — convention, not a standard)

**Confidence note:** Web search and Context7 were unavailable during this research session. All patterns are based on training data from stable, well-documented libraries (React 18, React Router v6, Zustand 4, Axios 1.x, Vite 5). These APIs have been stable for 12-24 months with no breaking changes expected. Flag for validation against latest library versions before implementation begins.
