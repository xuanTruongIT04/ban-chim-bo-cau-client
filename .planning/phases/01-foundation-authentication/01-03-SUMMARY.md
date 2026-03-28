---
phase: 01
plan: 03
subsystem: routing
tags: [router, layouts, protected-routes, auth-guard, app-composition]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [app-router, admin-layout, customer-layout, admin-route-guard]
  affects: [01-04]
tech_stack:
  added: []
  patterns:
    - createBrowserRouter with nested AdminRoute guard wrapping AdminLayout
    - AppInitializer pattern: validate token on mount, setInitializing(false) in finally
    - setNavigator registered in layout useEffect for imperative navigation
    - authApi stub pattern: minimal stub in Plan 03, replaced by full implementation in Plan 04
key_files:
  created:
    - src/router/index.tsx
    - src/components/common/AdminRoute.tsx
    - src/components/common/PageLoader.tsx
    - src/components/common/AppInitializer.tsx
    - src/layouts/AdminLayout.tsx
    - src/layouts/CustomerLayout.tsx
    - src/pages/admin/DashboardPage.tsx
    - src/pages/admin/PlaceholderPage.tsx
    - src/pages/admin/LoginPage.tsx
    - src/pages/customer/HomePage.tsx
    - src/api/authApi.ts
  modified:
    - src/App.tsx
decisions:
  - "authApi stub created in Plan 03 to unblock AdminLayout logout wiring; Plan 04 replaces it with full login/me/logout implementation"
  - "LoginPage stub created so router compiles; replaced with real form in Plan 04"
  - "setNavigator registered in both AdminLayout and CustomerLayout so navigation service works across all route sections"
  - "AppInitializer uses empty dependency array in useEffect — intentional single-mount-only validation"
metrics:
  duration_seconds: 260
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 11
  files_modified: 1
---

# Phase 01 Plan 03: Routing, Layouts, and App Composition Summary

**One-liner:** React Router v6 `createBrowserRouter` with AdminRoute guard (isInitializing + token + role), AdminLayout (240px sidebar + logout), CustomerLayout (sticky navbar + cart badge), and QueryClientProvider > ConfigProvider > AppInitializer > RouterProvider App.tsx root composition.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | AdminRoute, PageLoader, AppInitializer, layouts, placeholder pages | fedfd62 | AdminRoute.tsx, PageLoader.tsx, AppInitializer.tsx, AdminLayout.tsx, CustomerLayout.tsx, DashboardPage.tsx, PlaceholderPage.tsx, HomePage.tsx, authApi.ts |
| 2 | Router configuration and App.tsx root composition | ce890a7 | router/index.tsx, App.tsx, LoginPage.tsx |

---

## What Was Built

### AdminRoute guard (`src/components/common/AdminRoute.tsx`)
Three-state guard: `isInitializing=true` → `<PageLoader />` (prevents route flicker), no token → redirect `/admin/login`, wrong role → redirect `/admin/login`, otherwise `<Outlet />`.

### PageLoader (`src/components/common/PageLoader.tsx`)
Full-screen centered AntD `Spin size="large" tip="Đang tải..."` on `#f5f5f5` background. Shown during app initialization window.

### AppInitializer (`src/components/common/AppInitializer.tsx`)
On mount: if token exists, calls `GET /api/me`. Success → `setUser()`. Failure → `clearAuth()`. Always → `setInitializing(false)` in `.finally()`. No token → `setInitializing(false)` immediately. Prevents permanent loading screen (Pitfall 6).

### AdminLayout (`src/layouts/AdminLayout.tsx`)
- `Layout.Sider` width=240px, white background
- Logo area 64px height with "Bán Chim Bồ Câu" text
- AntD `Menu` mode="inline" with Dashboard/Sản phẩm/Đơn hàng items and icons
- `selectedKeys` derived from `useLocation().pathname`
- Header: admin name + "Đăng xuất" button with `LogoutOutlined`
- Logout: calls `authApi.logout()` first (server-side Sanctum invalidation per AUTH-02), then `clearAuth()`, then `navigateTo('/admin/login')`
- `setNavigator(navigate)` registered in `useEffect`

### CustomerLayout (`src/layouts/CustomerLayout.tsx`)
- Sticky `Layout.Header` height=64px with "Bán Chim Bồ Câu" logo link
- Empty `Menu mode="horizontal"` (populated Phase 2)
- Cart `Badge` wrapping `ShoppingCartOutlined` with count from `useCartStore`
- `setNavigator(navigate)` registered in `useEffect`

### Router (`src/router/index.tsx`)
```
/admin/login          → LoginPage (public)
<AdminRoute>
  <AdminLayout>
    /admin            → Navigate to /admin/dashboard
    /admin/dashboard  → DashboardPage
    /admin/products   → PlaceholderPage "Sản phẩm"
    /admin/orders     → PlaceholderPage "Đơn hàng"
<CustomerLayout>
  /                   → HomePage
```

### App.tsx
`QueryClientProvider(retry=1, staleTime=5min) > ConfigProvider(antdTheme) > AppInitializer > RouterProvider`

---

## Deviations from Plan

### Auto-added Items

**1. [Rule 3 - Stub] Created `src/api/authApi.ts` stub to unblock AdminLayout compilation**
- **Found during:** Task 1
- **Issue:** Plan 04 creates authApi but AdminLayout imports it; Task 1 would fail to compile without it
- **Fix:** Created minimal stub with just `logout()` method; Plan 04 will replace with full implementation
- **Files modified:** `src/api/authApi.ts` (new)
- **Commit:** fedfd62

None other — plan executed as written.

---

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/pages/admin/LoginPage.tsx` | Returns placeholder div | Full login form implemented in Plan 04 |
| `src/api/authApi.ts` | Only `logout()` method | Full authApi (login, logout, getMe) implemented in Plan 04 |

Both stubs are intentional and required by plan design (Plan 04 dependency). They do not prevent this plan's goal (routing + guard structure) from being achieved.

---

## Verification

- `npx tsc --noEmit`: exits code 0 (no TypeScript errors)
- `npm run build`: exits code 0 (build succeeds, 628kb bundle — expected for AntD without code splitting; lazy-load deferred to Phase 3)
- `npx vitest run`: 20/20 tests pass (3 test files)
- Route tree matches D-23 specification
- AdminRoute correctly guards with isInitializing + token + role checks
- Admin logout calls authApi.logout() before clearAuth() (AUTH-02 compliance)
- Customer layout wired with cart badge from useCartStore

---

## Self-Check: PASSED

Files created/exist:
- src/router/index.tsx: FOUND
- src/components/common/AdminRoute.tsx: FOUND
- src/components/common/PageLoader.tsx: FOUND
- src/components/common/AppInitializer.tsx: FOUND
- src/layouts/AdminLayout.tsx: FOUND
- src/layouts/CustomerLayout.tsx: FOUND
- src/pages/admin/DashboardPage.tsx: FOUND
- src/pages/admin/PlaceholderPage.tsx: FOUND
- src/pages/admin/LoginPage.tsx: FOUND
- src/pages/customer/HomePage.tsx: FOUND
- src/api/authApi.ts: FOUND
- src/App.tsx: MODIFIED

Commits exist:
- fedfd62: Task 1 — layouts and components
- ce890a7: Task 2 — router and App.tsx
