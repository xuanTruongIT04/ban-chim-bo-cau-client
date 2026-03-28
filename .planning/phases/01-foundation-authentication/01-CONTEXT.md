# Phase 1: Foundation + Authentication - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold toàn bộ infrastructure layer và implement admin authentication. Bao gồm: build tool config, clean architecture folder structure, multi-env config, Axios instance với interceptors, React Router v6 với protected routes, Zustand stores (auth + cart), TanStack Query setup, Ant Design config, và admin login/logout flow.

**Scope clarification:** Auth là admin-only. Customer là guest hoàn toàn — không có account, không cần login để mua hàng. Order history tra cứu bằng số điện thoại (public endpoint, không cần token).

</domain>

<decisions>
## Implementation Decisions

### Laravel Auth Contract

- **D-01:** Backend dùng **Laravel Sanctum API tokens** (không phải SPA mode, không phải Tymon JWT)
- **D-02:** `POST /api/auth/login` response shape: `{ access_token: string, token_type: 'Bearer' }`
- **D-03:** Token có expiry — khi 401, redirect về `/admin/login` (re-login, không có silent refresh)
- **D-04:** Sau login, gọi `GET /api/me` để lấy user info (id, name, email, role)
- **D-05:** User object có field `role: 'admin' | 'customer'` — frontend dùng string comparison để check role
- **D-06:** Authorization header format: `Authorization: Bearer {access_token}`

### Token Storage Strategy

- **D-07:** Access token lưu trong **localStorage** (key: `auth_token`)
- **D-08:** Không cache user object trong localStorage — gọi `GET /api/me` mỗi khi app khởi động (nếu token tồn tại)
- **D-09:** Zustand auth store dùng `persist` middleware (persists `token` field to localStorage)
- **D-10:** Khi 401 response → clear token khỏi store + localStorage → redirect `/admin/login`

### Auth Scope — Customer

- **D-11:** **Customer không có account, không cần login.** Tất cả customer routes là public.
- **D-12:** Order history (Phase 4) = public endpoint tra cứu theo số điện thoại — không cần auth token
- **D-13:** AUTH-04 (customer self-registration) là **out of scope** — không build trang đăng ký customer
- **D-14:** AUTH-01, AUTH-02, AUTH-03 chỉ áp dụng cho admin

### Login Page UX

- **D-15:** Chỉ có **một trang login duy nhất**: `/admin/login` — dành riêng cho admin
- **D-16:** Design: centered card trên nền xám (gray background) — logo trên card, form bên dưới
- **D-17:** Sau login thành công → redirect `/admin/dashboard`
- **D-18:** Khi admin vào URL `/admin/*` mà chưa login → redirect thẳng `/admin/login` (không có ?redirect= param)

### Route Architecture

- **D-19:** Admin routes: `/admin/*` — tất cả protected bởi `AdminRoute` component
- **D-20:** Customer routes: `/*` — tất cả public, không cần authentication
- **D-21:** Admin layout: sidebar navigation bên trái + top header (logo + avatar + logout)
  - Sidebar items: Dashboard, Sản phẩm, Đơn hàng
- **D-22:** Customer layout: top navbar (logo + danh mục + cart icon)
- **D-23:** Route structure:
  ```
  / → CustomerLayout
    / → (Phase 2: Product list)
    /products/:id → (Phase 2: Product detail)
    /cart → (Phase 2: Cart)
    /checkout → (Phase 2: Checkout)
    /orders → (Phase 4: Order lookup by phone)

  /admin → AdminLayout (protected)
    /admin/login → AdminLoginPage (public, outside AdminLayout)
    /admin/dashboard → (Phase 3: Dashboard)
    /admin/products → (Phase 3: Product CRUD)
    /admin/orders → (Phase 3: Order management)
  ```
- **D-24:** `ProtectedRoute` (AdminRoute) check: token exists in store → render Outlet; else → Navigate to /admin/login

### Axios Instance

- **D-25:** Request interceptor: inject `Authorization: Bearer {token}` nếu token tồn tại trong auth store
- **D-26:** Response interceptor: khi 401 → dispatch logout action (clear store) → redirect `/admin/login`
- **D-27:** Dùng **request queue pattern** với `isRefreshing` flag để tránh race condition khi nhiều request song song cùng nhận 401
- **D-28:** Global error toast cho 5xx errors từ response interceptor

### Auth Store (Zustand)

- **D-29:** Auth store fields: `token: string | null`, `user: UserProfile | null`, `isInitializing: boolean`
- **D-30:** `isInitializing: true` khi app khởi động để tránh protected route flicker — set false sau khi /api/me complete (hoặc không có token)
- **D-31:** Zustand `persist` chỉ persist field `token` (không persist `user` hay `isInitializing`)

### Claude's Discretion

- Cách tổ chức TypeScript types cho API responses (centralized `src/types/api.ts` là recommended)
- Error message text khi login fail (wrong password, network error)
- Loading spinner style trên admin login form
- Cách đặt tên files và folders (camelCase vs kebab-case)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — v1 requirements (FOUND-01–10, AUTH-01–05 là scope Phase 1)
- `.planning/research/STACK.md` — Tech stack research với specific versions
- `.planning/research/ARCHITECTURE.md` — Clean architecture folder structure, data flow, build order
- `.planning/research/PITFALLS.md` — 18 pitfalls cụ thể, đặc biệt: Pitfall 1 (Axios race condition), Pitfall 5 (protected route flicker), Pitfall 10 (env vars), Pitfall 11 (auth contract)

### Scope Change (Auth)
- AUTH-04 (customer registration) đã xác nhận là out of scope — không build
- ACCOUNT-01/02 (order history) vẫn trong scope nhưng sẽ dùng phone lookup (Phase 4), không phải auth

No external API docs exist yet — Laravel endpoints cần được confirm khi build Phase 1.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield project — không có code hiện tại nào để reuse

### Established Patterns
- Chưa có patterns — Phase 1 sẽ establish tất cả baseline patterns

### Integration Points
- Laravel REST API tại URL cấu hình trong `VITE_API_BASE_URL` env var
- Auth endpoints cần confirm với backend: `POST /api/auth/login`, `GET /api/me`, `POST /api/auth/logout`

</code_context>

<specifics>
## Specific Ideas

- Admin login page: centered card trên nền xám — logo "Bán Chim Bồ Câu" trên card, form email + password bên dưới
- Admin sidebar: items Dashboard / Sản phẩm / Đơn hàng với icon từ Ant Design Icons
- Route `/admin` (không có path) → redirect `/admin/dashboard`

</specifics>

<deferred>
## Deferred Ideas

- Customer login với OTP qua SMS — scope creep, có thể thêm v2 nếu có nhu cầu
- `/admin/login?redirect=` param — có thể thêm sau nếu UX cần (không critical)
- Remember me checkbox trên admin login — defer v2

</deferred>
