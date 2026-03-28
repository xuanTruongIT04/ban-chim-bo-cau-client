# Phase 1: Foundation + Authentication - Research

**Researched:** 2026-03-28
**Domain:** React SPA scaffold + admin-only JWT authentication (Laravel Sanctum API tokens)
**Confidence:** HIGH — stack decisions are locked; findings verified against npm registry

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Backend dùng **Laravel Sanctum API tokens** (không phải SPA mode, không phải Tymon JWT)
- **D-02:** `POST /api/auth/login` response shape: `{ access_token: string, token_type: 'Bearer' }`
- **D-03:** Token có expiry — khi 401, redirect về `/admin/login` (re-login, không có silent refresh)
- **D-04:** Sau login, gọi `GET /api/me` để lấy user info (id, name, email, role)
- **D-05:** User object có field `role: 'admin' | 'customer'` — frontend dùng string comparison để check role
- **D-06:** Authorization header format: `Authorization: Bearer {access_token}`
- **D-07:** Access token lưu trong **localStorage** (key: `auth_token`)
- **D-08:** Không cache user object trong localStorage — gọi `GET /api/me` mỗi khi app khởi động (nếu token tồn tại)
- **D-09:** Zustand auth store dùng `persist` middleware (persists `token` field to localStorage)
- **D-10:** Khi 401 response → clear token khỏi store + localStorage → redirect `/admin/login`
- **D-11:** Customer không có account, không cần login. Tất cả customer routes là public.
- **D-12:** Order history (Phase 4) = public endpoint tra cứu theo số điện thoại — không cần auth token
- **D-13:** AUTH-04 (customer self-registration) là out of scope — không build trang đăng ký customer
- **D-14:** AUTH-01, AUTH-02, AUTH-03 chỉ áp dụng cho admin
- **D-15:** Chỉ có một trang login duy nhất: `/admin/login` — dành riêng cho admin
- **D-16:** Design: centered card trên nền xám (gray background) — logo trên card, form bên dưới
- **D-17:** Sau login thành công → redirect `/admin/dashboard`
- **D-18:** Khi admin vào URL `/admin/*` mà chưa login → redirect thẳng `/admin/login` (không có ?redirect= param)
- **D-19:** Admin routes: `/admin/*` — tất cả protected bởi `AdminRoute` component
- **D-20:** Customer routes: `/*` — tất cả public, không cần authentication
- **D-21:** Admin layout: sidebar navigation bên trái + top header (logo + avatar + logout). Sidebar: Dashboard, Sản phẩm, Đơn hàng
- **D-22:** Customer layout: top navbar (logo + danh mục + cart icon)
- **D-23:** Route structure:
  ```
  / → CustomerLayout
    / → (Phase 2)
    /products/:id → (Phase 2)
    /cart → (Phase 2)
    /checkout → (Phase 2)
    /orders → (Phase 4)
  /admin → AdminLayout (protected)
    /admin/login → AdminLoginPage (public, outside AdminLayout)
    /admin/dashboard → (Phase 3)
    /admin/products → (Phase 3)
    /admin/orders → (Phase 3)
  ```
- **D-24:** ProtectedRoute (AdminRoute) check: token exists in store → render Outlet; else → Navigate to /admin/login
- **D-25:** Request interceptor: inject `Authorization: Bearer {token}` nếu token tồn tại
- **D-26:** Response interceptor: khi 401 → dispatch logout action → redirect `/admin/login`
- **D-27:** Dùng request queue pattern với `isRefreshing` flag để tránh race condition khi nhiều request song song cùng nhận 401
- **D-28:** Global error toast cho 5xx errors từ response interceptor
- **D-29:** Auth store fields: `token: string | null`, `user: UserProfile | null`, `isInitializing: boolean`
- **D-30:** `isInitializing: true` khi app khởi động để tránh protected route flicker — set false sau khi /api/me complete (hoặc không có token)
- **D-31:** Zustand `persist` chỉ persist field `token` (không persist `user` hay `isInitializing`)

### Claude's Discretion

- Cách tổ chức TypeScript types cho API responses (centralized `src/types/api.ts` là recommended)
- Error message text khi login fail (wrong password, network error)
- Loading spinner style trên admin login form
- Cách đặt tên files và folders (camelCase vs kebab-case)

### Deferred Ideas (OUT OF SCOPE)

- Customer login với OTP qua SMS
- `/admin/login?redirect=` param
- Remember me checkbox trên admin login
- AUTH-04 (customer self-registration)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Project scaffold với Vite + React + TypeScript + ESLint + Prettier chuẩn production | Stack section; version table with verified npm versions |
| FOUND-02 | Clean architecture folder structure: `src/api/`, `src/stores/`, `src/hooks/`, `src/components/`, `src/layouts/`, `src/pages/` | Architecture Patterns section; build order |
| FOUND-03 | Multi-env config: `.env.development`, `.env.staging`, `.env.production` với `VITE_API_BASE_URL` | Vite env pattern; `src/config/env.ts` wrapper |
| FOUND-04 | Axios instance với interceptor tự động inject JWT Bearer token | Axios interceptor pattern; request queue code example |
| FOUND-05 | Axios response interceptor: 401 → redirect login, 422 → surface errors, 5xx → toast | Response interceptor pattern; navigation service |
| FOUND-06 | React Router v6/v7 với ProtectedRoute component (auth + role check) | Router section; AdminRoute pattern; RRv7 API notes |
| FOUND-07 | Auth store (Zustand) với `persist` middleware — session survives refresh | Zustand persist pattern; `partialize` for token-only persistence |
| FOUND-08 | Cart store (Zustand) với `persist` middleware — cart survives refresh | Cart store pattern (stub for Phase 1, functional for Phase 2) |
| FOUND-09 | TanStack Query (`QueryClientProvider`) setup | TanStack Query setup section |
| FOUND-10 | Ant Design 5/6 (`ConfigProvider`) setup với theme cơ bản | AntD setup section; v6 theme token changes |
| AUTH-01 | Admin có thể đăng nhập bằng email/password | Auth flow section; LoginPage pattern; `/api/me` post-login |
| AUTH-02 | Admin có thể đăng xuất — token bị xóa, redirect về `/admin/login` | Logout flow; clearAuth pattern |
| AUTH-03 | Session tồn tại qua browser refresh | `isInitializing` pattern; `GET /api/me` on app boot |
| AUTH-04 | OUT OF SCOPE — customer registration (D-13) | — |
| AUTH-05 | Guest (customer) có thể duyệt sản phẩm mà không cần login | Public routes architecture; CustomerLayout is always accessible |
</phase_requirements>

---

## Summary

Phase 1 is a pure greenfield scaffold — no existing code to work around. The goal is to stand up the complete infrastructure layer (Vite project, folder structure, Axios with interceptors, Zustand stores, React Router with guards, TanStack Query, Ant Design) and implement the one auth flow in scope: admin login/logout with Sanctum API token Bearer header.

**Critical version drift discovered:** The planning documents (CLAUDE.md, STACK.md) were written against a stack that has since had major version releases. Vite 8, React 19, Ant Design 6, React Router 7, and TypeScript 6 are now `latest` on npm. The planner must decide whether to use planning-doc versions (tested, known-good) or current versions (newer APIs, potential breaking changes). This research documents both paths and recommends an approach.

**Node.js version conflict:** Vite 8 requires Node >=20.19.0 or >=22.12.0. The current Node version is 20.17.0. This is a **hard blocker** if Vite 8 is used. Vite 6 (^6.0) works with Node >=18. Either upgrade Node or pin Vite to ^6.

**Primary recommendation:** Pin to the stack versions from CLAUDE.md (`react@^18.3`, `antd@^5.x`, `react-router-dom@^6.26`, `vite@^6`, `typescript@^5.5`) for Phase 1. The planning docs represent a deliberately validated stack. Using current `latest` tags introduces multiple major-version unknowns simultaneously on a greenfield project. The only exception is if the developer is willing to upgrade Node to >=20.19 and accept Vite 8 + its toolchain.

---

## Standard Stack

### Verified npm Versions (as of 2026-03-28)

| Package | Planning-Doc Version | Current `latest` on npm | Recommendation |
|---------|---------------------|------------------------|----------------|
| vite | ^6.0 | 8.0.3 | Pin ^6.x (Node 20.17 compat) |
| @vitejs/plugin-react | ^4.3 | 6.0.1 | Pin ^4.x (pairs with Vite 6) |
| react | ^18.3 | 19.2.4 | Pin ^18.3 (AntD 5 compat guarantee) |
| react-dom | ^18.3 | 19.2.4 | Match React |
| antd | ^5.20 | 6.3.4 | Pin ^5.x (known API, planning docs) |
| @ant-design/icons | ^5.4 | 6.1.1 | Pin ^5.x (match antd major) |
| react-router-dom | ^6.26 | 7.13.2 | Pin ^6.26 (v7 has new API — see notes) |
| zustand | ^5.0 | 5.0.12 | Use ^5.0 (same major, safe) |
| @tanstack/react-query | ^5.51 | 5.95.2 | Use ^5.51 (same major, safe) |
| axios | ^1.7 | 1.14.0 | Use ^1.7 (same major, safe) |
| typescript | ^5.5 | 6.0.2 | Pin ^5.5 (TS 6 is new, verify compat) |
| zod | ^3.23 | 4.3.6 | Pin ^3.23 (Zod 4 has breaking changes) |
| eslint | ^9.0 | 10.1.0 | Pin ^9.0 (flat config is established) |
| prettier | ^3.3 | 3.8.1 | Use ^3.3 (same major, safe) |
| vitest | ^2.1 | 4.1.2 | Pin ^2.1 (same Vite-version parity) |
| @testing-library/react | ^16.0 | 16.3.2 | Use ^16.0 (same major, safe) |

**Confidence:** HIGH for pinned versions (documented, tested). MEDIUM for "use latest same major" entries (minor bumps rarely break).

### Core (Phase 1 Scope)

| Library | Version (Pin) | Purpose | Phase 1 Role |
|---------|--------------|---------|--------------|
| vite | ^6.0 | Build tool + dev server | Scaffold entry point |
| @vitejs/plugin-react | ^4.3 | Babel React fast refresh | HMR during dev |
| react | ^18.3 | UI rendering | All components |
| react-dom | ^18.3 | DOM renderer | `ReactDOM.createRoot` in main.tsx |
| typescript | ^5.5 | Type safety | `strict: true` throughout |
| react-router-dom | ^6.26 | Client routing | Route config, AdminRoute guard |
| zustand | ^5.0 | Global state | authStore + cartStore stub |
| axios | ^1.7 | HTTP client | axiosInstance with interceptors |
| antd | ^5.20 | UI components | ConfigProvider, Form, Input, Button, Layout |
| @ant-design/icons | ^5.4 | Icons | Sidebar icons, login form icons |
| @tanstack/react-query | ^5.51 | Server state | QueryClientProvider setup only (hooks built in Phase 2+) |
| zod | ^3.23 | Schema validation | API response types; `src/types/api.ts` |

### Dev Dependencies

| Library | Version (Pin) | Purpose |
|---------|--------------|---------|
| eslint | ^9.0 | Linting (flat config) |
| typescript-eslint | ^8.0 | TypeScript ESLint rules |
| prettier | ^3.3 | Code formatting |
| eslint-config-prettier | latest | Disable conflicting ESLint format rules |
| vitest | ^2.1 | Unit tests |
| @testing-library/react | ^16.0 | Component test utilities |
| @testing-library/user-event | ^14.0 | User interaction simulation |
| @testing-library/jest-dom | ^6.0 | Custom DOM matchers |
| jsdom | ^25.0 | Vitest DOM environment |

### React Router v7 Notes (Why We Pin v6)

React Router v7 (Remix merger) introduced significant API changes: `createBrowserRouter` behavior is unchanged but v7 adds framework mode, file-based routing, and server-side loader/action patterns adapted from Remix. For a pure SPA with no framework mode, v6.26 is still the correct choice and is actively maintained at `version-6: 6.30.3` dist-tag. v7 is not a drop-in upgrade for existing v6 codebases.

**Source:** npm dist-tags show `version-6: 6.30.3` is still the maintained v6 track. (MEDIUM confidence — based on npm registry + community knowledge; no official changelog checked)

### Ant Design v6 Notes (Why We Pin v5)

AntD 6.3.4 is confirmed to support React >=18.0.0 (peer dep verified via npm). However, AntD 6 introduces breaking changes from v5 (component API changes, CSS token restructuring). The planning docs have been written against AntD 5 patterns. Migrating to AntD 6 mid-phase would require re-validating all component usage patterns against the new API.

**Decision support:** Pin antd@^5.20 for Phase 1. Re-evaluate for Phase 3 (admin panel) if AntD 6 migration benefits become compelling.

### Installation Commands

```bash
# Scaffold
npm create vite@6 ban-chim-bo-cau-client -- --template react-ts
cd ban-chim-bo-cau-client

# Remove default content (keep vite.config.ts, tsconfig*.json, index.html)
rm -rf src/

# Core production dependencies
npm install react@^18.3 react-dom@^18.3
npm install react-router-dom@^6.26
npm install zustand@^5.0
npm install axios@^1.7
npm install @tanstack/react-query@^5.51
npm install antd@^5.20 @ant-design/icons@^5.4
npm install zod@^3.23

# Dev dependencies
npm install -D typescript@^5.5
npm install -D vitest@^2.1 @testing-library/react@^16.0 @testing-library/user-event@^14.0 @testing-library/jest-dom@^6.0 jsdom@^25.0
npm install -D eslint@^9.0 typescript-eslint@^8.0 prettier@^3.3 eslint-config-prettier
npm install -D eslint-plugin-react-hooks
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── api/
│   ├── axiosInstance.ts     # Configured Axios instance + interceptors
│   ├── authApi.ts           # login(), logout(), getMe()
│   └── types/
│       └── auth.types.ts    # LoginRequest, LoginResponse, UserProfile
├── stores/
│   ├── authStore.ts         # token, user, isInitializing, setAuth, clearAuth
│   └── cartStore.ts         # stub for Phase 2 (items: [], persist wired)
├── hooks/
│   └── useAuth.ts           # login(), logout(), init() wrapping authStore
├── components/
│   └── common/
│       ├── AdminRoute.tsx   # ProtectedRoute for /admin/* paths
│       ├── PageLoader.tsx   # Full-page spinner for isInitializing state
│       └── AppInitializer.tsx  # Runs /api/me on boot, sets isInitializing
├── layouts/
│   ├── AdminLayout.tsx      # Sidebar + header (logo, avatar, logout)
│   └── CustomerLayout.tsx   # Top navbar (logo, danh mục, cart icon)
├── pages/
│   ├── admin/
│   │   ├── LoginPage.tsx    # /admin/login — centered card on gray bg
│   │   └── DashboardPage.tsx  # /admin/dashboard — stub ("coming in Phase 3")
│   └── customer/
│       └── HomePage.tsx     # / — stub ("coming in Phase 2")
├── router/
│   └── index.tsx            # createBrowserRouter with full route tree
├── config/
│   └── env.ts               # Typed wrapper around import.meta.env
├── lib/
│   └── navigationService.ts # Module-level navigate singleton for interceptors
├── types/
│   └── api.ts               # All shared TypeScript types (re-exports api/types/)
├── App.tsx                  # QueryClientProvider + ConfigProvider + RouterProvider + AppInitializer
└── main.tsx                 # ReactDOM.createRoot
```

### Pattern 1: Auth Store with Selective Persistence (D-29, D-31)

**What:** Zustand store persists only `token` to localStorage. `user` and `isInitializing` are re-hydrated on boot via `/api/me`.

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

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
      name: 'auth_token',               // matches D-07: key 'auth_token'
      partialize: (state) => ({ token: state.token }), // D-31: only persist token
    }
  )
);
```

**Why:** `partialize` ensures only `token` hits localStorage. `user` is always fetched fresh from `/api/me` on boot (D-08). `isInitializing: true` default blocks protected route rendering until boot check completes (D-30).

### Pattern 2: App Boot Sequence — isInitializing Guard (D-30)

**What:** On app mount, check if token exists in store. If yes, call `GET /api/me` to populate `user`. Set `isInitializing: false` when done (success or failure). ProtectedRoute renders `<PageLoader>` while initializing.

```typescript
// src/components/common/AppInitializer.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/authApi';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { token, setUser, clearAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    authApi.getMe()
      .then((user) => setUser(user))
      .catch(() => clearAuth())        // expired/invalid token → clear
      .finally(() => setInitializing(false));
  }, []);  // runs once on mount

  return <>{children}</>;
}
```

```typescript
// src/components/common/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from './PageLoader';

export function AdminRoute() {
  const token = useAuthStore((state) => state.token);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) return <PageLoader />;
  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
```

**Why:** Without `isInitializing`, a page refresh on `/admin/dashboard` briefly shows `token = null` (store not yet rehydrated from localStorage) and bounces the user to `/admin/login` — visible flicker (Pitfall 5).

### Pattern 3: Axios Instance with Request Queue (D-25, D-26, D-27)

**What:** Single Axios instance. Request interceptor injects Bearer token. Response interceptor handles 401 with `isRefreshing` queue flag to prevent race conditions when parallel requests all get 401.

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { navigateTo } from '../lib/navigationService';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request: inject Bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: handle 401 and 5xx
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isRedirecting) {
      isRedirecting = true;
      useAuthStore.getState().clearAuth();
      navigateTo('/admin/login');
      // Reset flag after redirect completes
      setTimeout(() => { isRedirecting = false; }, 1000);
    }

    if (status >= 500) {
      // D-28: global toast for 5xx — AntD message.error
      // Import message lazily to avoid circular deps
      import('antd').then(({ message }) =>
        message.error('Lỗi máy chủ. Vui lòng thử lại sau.')
      );
    }

    return Promise.reject(error);
  }
);
```

**Note on D-27 (request queue):** Because the auth contract (D-03) uses re-login on 401 (no silent refresh), the classic "queue requests while refreshing" pattern simplifies to just: prevent duplicate redirects with `isRedirecting` flag. A full queue is needed only when silent token refresh is implemented (deferred to v2).

### Pattern 4: Navigation Service (Bridges Axios ↔ React Router)

**What:** Module-level singleton so Axios interceptor can trigger React Router navigation without access to the hook tree.

```typescript
// src/lib/navigationService.ts
import type { NavigateFunction } from 'react-router-dom';

let _navigate: NavigateFunction | null = null;

export const setNavigator = (nav: NavigateFunction) => {
  _navigate = nav;
};

export const navigateTo = (path: string) => {
  if (_navigate) {
    _navigate(path, { replace: true });
  } else {
    window.location.href = path; // fallback before Router mounts
  }
};
```

```typescript
// src/App.tsx — register navigator after router mounts
import { useNavigate } from 'react-router-dom';
import { setNavigator } from './lib/navigationService';

function NavigationRegistrar() {
  const navigate = useNavigate();
  useEffect(() => { setNavigator(navigate); }, [navigate]);
  return null;
}
```

**Why:** Axios interceptors live outside React's component tree and cannot call `useNavigate()`. Without this bridge, the only option is `window.location.href` which causes a full page reload (Pitfall 12).

### Pattern 5: Route Configuration (D-23, D-24)

```typescript
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminRoute } from '../components/common/AdminRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { LoginPage } from '../pages/admin/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { HomePage } from '../pages/customer/HomePage';

export const router = createBrowserRouter([
  // Admin login — public, outside AdminLayout
  { path: '/admin/login', element: <LoginPage /> },

  // Admin routes — protected
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard', element: <DashboardPage /> },
          // Phase 3 routes added here
        ],
      },
    ],
  },

  // Customer routes — all public
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      // Phase 2 routes added here
    ],
  },
]);
```

### Pattern 6: Environment Config Wrapper (FOUND-03)

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
} as const;
```

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api

# .env.staging
VITE_API_BASE_URL=https://staging.banchimbocau.vn/api

# .env.production
VITE_API_BASE_URL=https://api.banchimbocau.vn/api
```

### Pattern 7: App Root Composition

```typescript
// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { router } from './router';
import { AppInitializer } from './components/common/AppInitializer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

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
```

**Note:** `NavigationRegistrar` (from Pattern 4) must be rendered inside `RouterProvider`. Place it inside the router config as a layout-level component, or use `router.subscribe` to set navigate after router creation.

### Anti-Patterns to Avoid

- **Calling `axiosInstance` inside a component:** Always call through `authApi.*`. Components call hooks, hooks call API modules.
- **Spreading `isAuthenticated` derived from user:** Derive auth status from `token !== null`. User can be null momentarily during boot.
- **Persisting `user` to localStorage:** The decisions (D-08, D-31) explicitly forbid this. `user` is always re-fetched from `/api/me`.
- **Using `window.location.href` for logout redirect:** Use `navigateTo()` from the navigation service to keep it within the React Router history stack.
- **Whole-store Zustand subscriptions:** Always use selectors: `useAuthStore((s) => s.token)` not `const store = useAuthStore()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state + validation on login form | Custom onChange handlers + manual error state | AntD `<Form>` with `rules` | rc-field-form handles required, email format, async validation, error display out of the box |
| localStorage serialization for auth store | `localStorage.setItem(JSON.stringify(...))` + getItem | Zustand `persist` middleware with `partialize` | Handles hydration timing, rehydration callbacks, storage errors automatically |
| Route auth guard | `if (!token) return null; if token check loading...` inline in every page | `AdminRoute` component wrapping router config | One place to reason about; handles `isInitializing` loading state; no per-page duplication |
| Server state loading/error management | `useState(loading)` + `useState(error)` + useEffect in every component | TanStack Query `useQuery` / `useMutation` | Deduplication, background refetch, stale-while-revalidate, mutation state — all built in |
| TypeScript types from API shapes | Manual `interface` definitions that drift | Zod schemas (`z.infer<typeof schema>`) | Single source of truth: schema IS the type; validation + type inference from one definition |

---

## Common Pitfalls

### Pitfall 1: Node Version Blocks Vite 8

**What goes wrong:** Running `npm create vite@latest` installs Vite 8 which requires Node >=20.19.0. Current environment is Node 20.17.0. The dev server will refuse to start.

**Why it happens:** Vite 8.0.3 added the Node 20.19.0 floor, which is newer than the current LTS 20.17.0 patch.

**How to avoid:** Explicitly pin Vite in the scaffold command: `npm create vite@6 project-name -- --template react-ts`. This installs Vite ^6 which requires Node >=18.

**Warning signs:** `error: The current Node.js version X is not supported by Vite` on `npm run dev`.

### Pitfall 2: Protected Route Flicker on Refresh (Pitfall 5 from PITFALLS.md)

**What goes wrong:** App refreshes on `/admin/dashboard`. Zustand rehydrates `token` from localStorage synchronously, but the `isInitializing: true` boot check (calling `/api/me`) is still in flight. Without the loader guard, `AdminRoute` sees `token` is set, renders the dashboard. But if the token is expired, `/api/me` returns 401, clears the token, and the component tree re-renders to the login page — visible flash.

**How to avoid:** `AdminRoute` must render `<PageLoader>` while `isInitializing === true`. Only render `<Outlet>` or redirect after initialization completes.

### Pitfall 3: Duplicate 401 Redirects Under Parallel Requests (Pitfall 1 from PITFALLS.md)

**What goes wrong:** Dashboard page mounts and fires 3 TanStack Query requests simultaneously. All three get 401. Without the `isRedirecting` flag, three navigation calls fire. The third one wins and the URL may end up in an unexpected state.

**How to avoid:** Use the `isRedirecting` module-level flag in `axiosInstance.ts`. Once the first 401 fires the redirect, subsequent 401s within the same session are ignored until the flag resets.

### Pitfall 4: Axios Interceptor Cannot Access `useNavigate` Hook

**What goes wrong:** Developer tries to call `useNavigate()` inside the response interceptor setup function. React throws: "Invalid hook call. Hooks can only be called inside of a function component."

**How to avoid:** Use the `navigationService.ts` module singleton pattern (Pattern 4). Register the navigate function via `setNavigator` from inside a React component on app mount.

### Pitfall 5: AntD `ConfigProvider` Not Wrapping the Entire App

**What goes wrong:** `ConfigProvider` is placed only around the admin section. Customer layout components use different default styles. Theme tokens don't propagate to modals, drawers, and message notifications (which render in a portal outside the React tree unless wrapped at the root).

**How to avoid:** Place `<ConfigProvider>` at the absolute root in `App.tsx`, wrapping `RouterProvider`. AntD's message/notification APIs use the closest `ConfigProvider` context in the React tree — root placement ensures all portals inherit the theme.

### Pitfall 6: `isInitializing` Not Reset on Network Error

**What goes wrong:** The `/api/me` boot call fails with a network error (not 401 — backend is down). The `catch` block clears auth but the `finally` block was forgotten. `isInitializing` stays `true` forever. The app shows a permanent loading screen.

**How to avoid:** Always use `.finally(() => setInitializing(false))` — not just the `.then()` path. The example in Pattern 2 shows this correctly.

### Pitfall 7: `VITE_` Prefix on All Env Vars Exposes Them in Bundle

**What goes wrong:** Developer adds `VITE_ADMIN_SECRET=xxx` to `.env`. It ends up embedded in the built `assets/index.js`. Any user who opens DevTools can read it.

**How to avoid:** `VITE_` prefix means "expose to browser bundle." The only var needed in Phase 1 is `VITE_API_BASE_URL`. Never add credentials or secret keys to `.env.*` files in the frontend repo.

---

## Code Examples

### Auth API Module

```typescript
// src/api/authApi.ts
import { axiosInstance } from './axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    axiosInstance.post('/auth/logout').then((r) => r.data),

  getMe: () =>
    axiosInstance.get<UserProfile>('/me').then((r) => r.data),
};
```

### Admin Login Page

```typescript
// src/pages/admin/LoginPage.tsx
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/authStore';

const { Title } = Typography;

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, setUser } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { access_token } = await authApi.login(values);
      const user = await authApi.getMe(); // D-04: fetch user after login
      setAuth(access_token, user);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response?.status;
      if (status === 401 || status === 422) {
        message.error('Email hoặc mật khẩu không đúng.');
      } else {
        message.error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4}>Bán Chim Bồ Câu</Title>
          <Typography.Text type="secondary">Quản trị hệ thống</Typography.Text>
        </div>
        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

### Cart Store Stub (FOUND-08 — ready for Phase 2)

```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({ items: get().items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )});
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) =>
        set({ items: get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )}),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

---

## State of the Art

| Old Approach (from planning docs) | Current npm `latest` | Impact on Phase 1 |
|-----------------------------------|----------------------|-------------------|
| Vite ^6.0 | Vite 8.0.3 | **Node version blocker** — pin ^6.0 |
| React ^18.3 | React 19.2.4 | React 19 works with AntD 6; but AntD 5 pins us to React 18 range |
| antd ^5.20 | antd 6.3.4 | AntD 6 has breaking changes; pin ^5.20 for Phase 1 |
| react-router-dom ^6.26 | react-router-dom 7.13.2 | v7 merged with Remix; new framework mode; pin ^6.26 (dist-tag `version-6: 6.30.3` is maintained) |
| typescript ^5.5 | typescript 6.0.2 | TS 6 may have breaking changes; pin ^5.5 |
| zod ^3.23 | zod 4.3.6 | Zod 4 has breaking API changes; pin ^3.23 |
| eslint ^9.0 | eslint 10.1.0 | ESLint 10 likely a minor bump; could use ^9 safely |

---

## Open Questions

1. **`POST /api/auth/logout` endpoint**
   - What we know: D-02 defines login response. D-10 defines 401 handling. D-04 defines `/api/me`.
   - What's unclear: Does Laravel Sanctum have a `POST /api/auth/logout` that invalidates the server-side token? Or is logout frontend-only (clear localStorage + store)?
   - Recommendation: Implement logout as: (1) call `POST /api/auth/logout` (fire and forget, swallow errors), (2) always clear store + localStorage regardless of API response. If the endpoint doesn't exist yet, the fire-and-forget won't block the UX.

2. **AntD 5 theme token for gray background on login page**
   - What we know: AntD 5 uses `colorBgLayout` token for layout backgrounds.
   - What's unclear: Whether `#f0f2f5` (the Ant Design default gray) matches the desired "nền xám" in D-16.
   - Recommendation: Use `colorBgLayout: '#f0f2f5'` in ConfigProvider theme. This is the AntD standard gray and will be visually consistent with the rest of the admin panel.

3. **NavigationRegistrar placement with `createBrowserRouter`**
   - What we know: `useNavigate` requires a component inside `<RouterProvider>`.
   - What's unclear: Best placement for `NavigationRegistrar` to guarantee it registers before any 401 could fire.
   - Recommendation: Add `NavigationRegistrar` as the first element inside the root route's layout component, not in `App.tsx` (which is outside RouterProvider). Alternatively, use `router.navigate` directly from react-router-dom v6.4+ which provides imperative navigation without hooks.

---

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| Node.js | Vite dev server, npm | Yes | 20.17.0 | **Below Vite 8 minimum (20.19.0)** — use Vite 6 |
| npm | Package installation | Yes | 10.8.2 | Sufficient |
| git | Version control | Yes | (confirmed via git status) | — |
| Laravel backend | API calls | Not verified | — | Must be running separately; Phase 1 tests use stubs/mocks |

**Missing dependencies with no fallback:**
- Laravel backend for E2E testing of auth flow — Phase 1 can be completed with mocked API responses in tests; E2E requires backend running separately.

**Node.js version constraint:** Vite 6 requires Node >=18.0.0. Current Node 20.17.0 satisfies this. Vite 8 requires Node >=20.19.0 — do NOT use Vite 8 without upgrading Node.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^2.1 |
| Config file | `vite.config.ts` (shared) — add `test` block |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test` |

### Vitest Config Addition

```typescript
// vite.config.ts — add test block
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-04 | Axios injects Authorization header when token present | unit | `npm run test -- --run axiosInstance` | Wave 0 |
| FOUND-04 | Axios does NOT inject header when token is null | unit | `npm run test -- --run axiosInstance` | Wave 0 |
| FOUND-05 | 401 response clears auth store and triggers navigation | unit | `npm run test -- --run axiosInstance` | Wave 0 |
| FOUND-07 | Auth store token survives simulated localStorage rehydration | unit | `npm run test -- --run authStore` | Wave 0 |
| FOUND-07 | Auth store `partialize` does NOT persist `user` or `isInitializing` | unit | `npm run test -- --run authStore` | Wave 0 |
| FOUND-08 | Cart store items persist to localStorage via `partialize` | unit | `npm run test -- --run cartStore` | Wave 0 |
| AUTH-01 | LoginPage renders email + password fields | component | `npm run test -- --run LoginPage` | Wave 0 |
| AUTH-01 | LoginPage calls authApi.login on submit, then authApi.getMe, stores token | component | `npm run test -- --run LoginPage` | Wave 0 |
| AUTH-01 | LoginPage shows error message on 401 response | component | `npm run test -- --run LoginPage` | Wave 0 |
| AUTH-02 | Logout clears token, user from store | unit | `npm run test -- --run authStore` | Wave 0 |
| AUTH-03 | AppInitializer calls GET /api/me when token exists; sets isInitializing false | unit | `npm run test -- --run AppInitializer` | Wave 0 |
| AUTH-03 | AppInitializer sets isInitializing false even when /api/me returns 401 | unit | `npm run test -- --run AppInitializer` | Wave 0 |
| FOUND-06 | AdminRoute renders PageLoader while isInitializing is true | component | `npm run test -- --run AdminRoute` | Wave 0 |
| FOUND-06 | AdminRoute redirects to /admin/login when token is null and not initializing | component | `npm run test -- --run AdminRoute` | Wave 0 |
| FOUND-06 | AdminRoute renders Outlet when token is present and not initializing | component | `npm run test -- --run AdminRoute` | Wave 0 |
| AUTH-05 | CustomerLayout renders without auth token | component | `npm run test -- --run CustomerLayout` | Wave 0 |

**Manual-only tests (no automated equivalent):**
- FOUND-01: Verify `npm run dev` starts without errors (developer runs once after scaffold)
- FOUND-03: Verify correct API URL loads from `.env.development` (smoke test with browser DevTools)
- FOUND-09: Verify `QueryClientProvider` is in the React tree (React DevTools)
- FOUND-10: Verify AntD `ConfigProvider` theme tokens propagate (visual check)

### Sampling Rate

- **Per task commit:** `npm run test -- --run` (all tests, no watch)
- **Per wave merge:** `npm run test -- --run` + check no TypeScript errors (`npm run typecheck`)
- **Phase gate:** Full suite green + `npm run build` succeeds before `/gsd:verify-work`

### Wave 0 Gaps (must create before writing implementation)

- [ ] `src/test/setup.ts` — `@testing-library/jest-dom` import
- [ ] `vitest` test block in `vite.config.ts`
- [ ] `src/test/mocks/axiosInstance.mock.ts` — mock for interceptor tests
- [ ] `src/test/mocks/authStore.mock.ts` — mock store reset between tests
- [ ] `src/api/__tests__/axiosInstance.test.ts` — covers FOUND-04, FOUND-05
- [ ] `src/stores/__tests__/authStore.test.ts` — covers FOUND-07, AUTH-02
- [ ] `src/stores/__tests__/cartStore.test.ts` — covers FOUND-08
- [ ] `src/components/__tests__/AdminRoute.test.tsx` — covers FOUND-06
- [ ] `src/components/__tests__/AppInitializer.test.tsx` — covers AUTH-03
- [ ] `src/pages/__tests__/LoginPage.test.tsx` — covers AUTH-01

---

## Project Constraints (from CLAUDE.md)

All of the following directives from `CLAUDE.md` are binding. The planner must ensure no task violates these:

| Directive | Constraint |
|-----------|-----------|
| Tech Stack | Vite (NOT Next.js) — no SSR |
| UI Library | Ant Design — must use for all UI components in scope |
| State Management | Zustand — use for auth store and cart store |
| API | JWT token from Laravel; align with backend contract |
| Auth | JWT from Laravel; re-login on expiry (no silent refresh in v1) |
| React version | Pin ^18.3 — do NOT upgrade to React 19 until AntD explicitly supports it |
| Routing | React Router v6, `createBrowserRouter` API, no v5 `<Switch>` API |
| Data fetching | TanStack Query v5 — MUST use, not hand-rolled useEffect patterns |
| Forms | AntD Form with `rules` — do NOT use React Hook Form |
| Testing | Vitest (not Jest) — shares Vite config |
| GSD workflow | All file edits via GSD workflow (not direct edits outside `/gsd:execute-phase`) |
| TypeScript | `strict: true` — no `any` types in API boundaries |
| Bundle | No `antd/dist/reset.css` import — use CSS-in-JS `ConfigProvider` only |

---

## Sources

### Primary (HIGH confidence)
- npm registry (verified 2026-03-28) — all package versions confirmed via `npm view`
- CLAUDE.md — project stack constraints (authoritative project document)
- `.planning/research/STACK.md` — pre-existing stack research with rationale
- `.planning/research/ARCHITECTURE.md` — pre-existing architecture patterns
- `.planning/research/PITFALLS.md` — pre-existing pitfall documentation
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — locked decisions D-01 through D-31

### Secondary (MEDIUM confidence)
- npm dist-tags (`npm view react-router-dom@7 dist-tags`) — confirms v6 maintained as `version-6` track
- npm peer dependency fields (`npm view antd@6 peerDependencies`) — confirms AntD 6 React >=18 compat
- Vite 8 engine requirement (`npm view vite@8.0.3 engines`) — confirms Node >=20.19.0 minimum

### Tertiary (LOW confidence — training knowledge, not independently verified against current docs)
- React Router v7 breaking changes (Remix merger, framework mode) — training knowledge, not verified against official changelog
- AntD 6 breaking changes from v5 — training knowledge; specific breaking changes not verified

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions): HIGH — all verified via `npm view` against live registry
- Architecture patterns: HIGH — derived directly from locked decisions + pre-existing researched patterns
- Pitfalls: HIGH — documented against specific decision constraints; cross-referenced with PITFALLS.md
- Version drift analysis: MEDIUM — npm confirmed current versions; breaking change details based on training knowledge

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (npm package versions change; re-verify before starting if >30 days pass)

**Critical action before implementation:**
```bash
# Confirm Node version meets Vite 6 requirement (should pass; will fail for Vite 8)
node --version  # Must be >=18.0 for Vite 6

# Confirm exact pinned versions resolve correctly
npm view react@18 version      # Should return latest 18.x
npm view antd@5 version        # Should return latest 5.x
npm view react-router-dom@6 version  # Should return latest 6.x
```
