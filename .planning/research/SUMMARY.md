# Project Research Summary

**Project:** Ban Chim Bo Cau — React SPA Frontend
**Domain:** Niche e-commerce SPA (pigeon/chim bo cau sales) with Laravel REST API backend
**Researched:** 2026-03-28
**Confidence:** HIGH (stack and architecture patterns well-established; features confirmed against domain context)

## Executive Summary

This is a niche Vietnamese e-commerce storefront with a dual-surface design: a customer-facing purchase flow (browse, cart, checkout) and an admin panel for product and order management. The target audience uses mobile-first browsing with a strong preference for COD payment and Zalo/WhatsApp pre-purchase inquiries — patterns that directly shape feature priorities. Expert teams build this type of app as a client-side SPA with a layered architecture: a centralized API service layer, role-based routing, global state only for auth and cart, and server state managed via caching hooks. The overall scope is well-bounded and achievable in 4 phases without exotic dependencies.

The recommended approach is React 18 + Vite 6 + TypeScript, with Ant Design 5 providing the admin panel components (Table with server pagination, Form with validation), Zustand 5 for auth and cart state, TanStack Query for server state lifecycle, and React Router v6 for SPA routing. This stack is proven, has no significant peer-dependency conflicts, and its core APIs are stable across the training data window. The folder structure follows a strict layered model — api modules, stores, hooks, components, layouts, pages — where pages never call API modules directly, ensuring testability and preventing logic sprawl.

The primary risks are in Phase 1 (Foundation): the Laravel auth contract (Sanctum vs. Tymon JWT) must be agreed before writing any interceptor code; JWT storage in localStorage creates an XSS attack surface that requires a deliberate mitigation strategy; and the Axios interceptor must implement a request queue from day one to prevent token-refresh race conditions. These three issues are Phase 1 blockers — resolving them early prevents rewrites in later phases. All other pitfalls are moderate and addressable during feature development.

---

## Key Findings

### Recommended Stack

The stack is a tightly coupled set of complementary libraries with no redundancy. React 18.3 is explicitly preferred over React 19 due to Ant Design 5.x peer-dependency constraints — ecosystem maturity outweighs React 19's SPA-irrelevant features (Server Components, `use()` hook). Vite 6 replaces Webpack entirely: faster cold starts, native env handling, and zero config for React. TanStack Query is a strong recommendation added beyond the original spec because hand-rolled `useEffect`+`useState` data fetching is a documented source of bugs for the exact patterns this app requires (loading states, cache invalidation after mutations, pagination).

**Core technologies:**
- React 18.3 + react-dom: UI rendering — holds on v18 for AntD 5.x compatibility; do not upgrade to v19 until AntD explicitly supports it
- Vite 6 + @vitejs/plugin-react: bundler and dev server — first-class React, 5-10x faster than Webpack
- TypeScript 5.5 (strict mode): type safety — inferred type predicates, no v5.x breaking changes
- react-router-dom v6.26: client-side routing — `createBrowserRouter` with nested routes and `<ProtectedRoute>` guards
- Zustand 5: global client state — auth store and cart store only; use selectors, not whole-store subscriptions
- TanStack Query v5: server state lifecycle — caching, background refetch, mutation state; pairs with Axios
- axios v1.7: HTTP transport — single `axiosInstance` with request/response interceptors for JWT injection and 401 handling
- antd v5.20: UI component library — admin Table, Form, Modal, Drawer, Steps; CSS-in-JS, no global stylesheet import
- @ant-design/icons v5.4: icon set — tree-shakeable, required companion to antd
- @ant-design/plots v2.2: charts for admin dashboard — integrates with AntD design tokens (LOW confidence — verify version currency)
- zod v3.23: schema validation — use for API response validation and TypeScript type inference; do NOT replace AntD Form rules
- Vitest v2.1 + @testing-library/react v16: testing — shares Vite config, no separate Babel transform needed
- ESLint 9 (flat config) + Prettier 3.3: code quality — `typescript-eslint` v8 replaces old split-package approach

See `.planning/research/STACK.md` for full rationale and alternatives considered.

### Expected Features

The feature set splits cleanly into customer purchase flow and admin management flow. Both surfaces depend on a shared auth system. The niche (live pigeon inventory, COD-dominant Vietnamese market, Zalo contact preference) changes content but not e-commerce mechanics.

**Must have — Customer (table stakes):**
- Product listing with breed/price filter and keyword search
- Product detail page with image gallery, specs, stock status, Add-to-Cart CTA
- Cart (add/remove/update, persisted to localStorage via Zustand)
- Checkout form (name, phone, address — COD only for v1)
- Order confirmation page with order ID and "we'll call you" message
- Login/Register with JWT session persistence
- My Orders + Order Detail (auth-gated)
- Responsive layout tested at 375px (Vietnamese mobile-first users)
- Loading skeletons and error states on all data-fetch surfaces

**Must have — Admin (table stakes):**
- Dashboard with total products, total orders, pending orders count
- Product CRUD (create, edit, soft-delete) with image upload
- Order list with status filter, order detail view, status update workflow
- Protected routes with admin-role enforcement

**Should have (differentiators):**
- "Only N left" scarcity badge on product listing cards
- WhatsApp/Zalo contact button on product detail (low effort — promote to Phase 2)
- Order status timeline (Ant Design Steps) on My Orders
- Admin inline stock quick-edit in product table

**Defer to v2+:**
- Payment gateway (VNPay, MoMo, Stripe) — COD + bank transfer covers v1
- Product search autocomplete (debounced API endpoint required)
- Sales/revenue chart on admin dashboard (requires aggregation endpoint)
- Product reviews, wishlist, promotions/coupons, multi-language, SSR/SEO

See `.planning/research/FEATURES.md` for full feature dependency tree and anti-features list.

### Architecture Approach

The architecture is a layered SPA with strict unidirectional data flow and role-based route guarding. The critical structural rule is that pages never call API modules directly — all API access goes through custom hooks, which own loading and error state. This boundary keeps pages thin (target 100 lines), makes logic testable, and prevents the "fat page component" anti-pattern that is the most common source of technical debt in React SPAs at this scale.

**Major components:**
1. `api/` — HTTP calls only; plain object modules wrapping `axiosInstance`; returns typed data, no React
2. `stores/` — Zustand global state: `authStore` (user, token, role, persistence) and `cartStore` (items, localStorage persistence)
3. `hooks/` — stateful logic and data fetching orchestration; wraps `api/` modules with loading/error state
4. `components/` — pure UI rendering; `common/ProtectedRoute` and `common/RoleGuard` handle all auth/role conditional rendering
5. `layouts/` — `CustomerLayout`, `AdminLayout`, `AuthLayout` — page shell components (nav, sidebar, footer)
6. `pages/` — route-level components that compose hooks and components; orchestrators only
7. `router/` — `createBrowserRouter` definition with nested `<ProtectedRoute>` wrappers for customer and admin route groups
8. `lib/` — pure utility functions with zero React or store dependencies (`token.ts`, `formatters.ts`, `validators.ts`)

Build order follows dependency layers: foundation utilities first (env config, token lib, axiosInstance), then API modules, then Zustand stores, then custom hooks, then common components and router skeleton, then layouts, then domain components, then pages.

See `.planning/research/ARCHITECTURE.md` for complete folder structure, data flow diagrams, and code patterns for all 6 key patterns.

### Critical Pitfalls

1. **Laravel auth contract undefined (Sanctum vs. Tymon JWT)** — Resolve before writing any frontend auth code. Define `POST /api/auth/login` response shape, refresh endpoint, and cookie vs. Bearer token strategy with the backend team. This is a Phase 1 blocker.

2. **Axios interceptor token refresh race condition** — When multiple parallel requests get 401, naive interceptors fire multiple refresh calls. The fix is a request queue with an `isRefreshing` flag — implement this from the start in `axiosInstance.ts`, not as a retrofit.

3. **JWT in localStorage creates XSS attack surface** — Store access token in Zustand memory only; use `httpOnly` cookie for refresh token (requires Laravel backend cooperation). Decide the strategy before Phase 1 implementation begins.

4. **Protected route flicker on page refresh** — Auth store initializes synchronously but async `/auth/me` validation causes a window where `isAuthenticated` is false, bouncing authenticated users to `/login`. Add `isInitializing: true` to auth store and render a `<PageLoader>` instead of redirecting until initialization completes.

5. **Zustand store over-subscription causing cascade re-renders** — Always use selector functions (`useStore((s) => s.slice)`) instead of subscribing to the whole store. Split stores by domain (auth, cart — no monolith). Establish this discipline in Phase 1 before building features that consume state.

See `.planning/research/PITFALLS.md` for 18 total pitfalls with code-level prevention patterns and phase-specific warnings.

---

## Implications for Roadmap

Based on research, the feature dependency tree and architecture build order strongly suggest a 4-phase structure. The ordering is driven by two constraints: (1) auth must exist before any protected surface, and (2) architecture foundation layers must exist before any feature pages.

### Phase 1: Foundation + Authentication

**Rationale:** The entire app depends on the Axios instance (JWT interceptors), Zustand auth store, and role-based router guards. These cannot be retrofitted after features are built — and three of the five critical pitfalls live here. This phase has no user-visible deliverables but gates everything else.

**Delivers:** Project scaffold, environment config, axiosInstance with interceptors (including request queue for Pitfall 1), auth store with `isInitializing` guard (Pitfall 5), cartStore with `persist` middleware, ProtectedRoute component, router skeleton with customer and admin route groups, login page with role-based redirect.

**Addresses features:** Login/Register, persistent JWT session, protected routes, admin role enforcement.

**Must avoid:** Pitfall 1 (race condition), Pitfall 2 (XSS token storage), Pitfall 3 (CORS misconfiguration), Pitfall 5 (auth flicker), Pitfall 6 (store over-subscription), Pitfall 10 (leaked env vars), Pitfall 11 (auth contract mismatch), Pitfall 12 (navigate from interceptor).

**Research flag:** NEEDS pre-work — confirm Laravel auth package (Sanctum vs. Tymon), endpoint contracts, and token refresh mechanism with backend before writing interceptors.

### Phase 2: Customer Purchase Flow

**Rationale:** The primary revenue path for the business. All four steps (browse, view, cart, checkout) form a single user journey that must ship together to be testable end-to-end. WhatsApp/Zalo contact button is low-effort and high-value for this niche — include here.

**Delivers:** Product listing page with breed/price filter and search, product detail page with gallery and stock status, "Only N left" scarcity badge, WhatsApp/Zalo contact button, cart (add/remove/update, localStorage persistence), checkout form (COD), order confirmation page.

**Addresses features:** Product listing, product detail, search/filter, cart, checkout, order confirmation, stock indicator, Zalo contact.

**Uses stack:** TanStack Query hooks over `productApi`, Ant Design Card/Grid/Drawer for listing, Ant Design Form for checkout, cartStore with persist middleware.

**Must avoid:** Pitfall 4 (cart lost on refresh), Pitfall 13 (pagination not URL-synced), Pitfall 14 (missing debounce on search), Pitfall 18 (cart update triggers product re-fetch).

**Research flag:** Standard patterns — no research-phase needed.

### Phase 3: Admin Panel

**Rationale:** Admin panel depends on the product catalog existing (Phase 2 establishes product types/API contracts) and order data existing (orders are created by the checkout flow in Phase 2). The admin surfaces are internally independent but share the product and order API modules built in earlier phases.

**Delivers:** Admin dashboard (total products, total orders, pending count), product list table (sortable, paginated), product create/edit form with image upload, soft-delete product, order list table with status filter, order detail view, order status update workflow.

**Addresses features:** Admin dashboard, product CRUD, image upload, order management, order status workflow.

**Uses stack:** Ant Design Table (server pagination), Ant Design Form + Upload, Ant Design Steps for status timeline.

**Must avoid:** Pitfall 7 (AntD bundle bloat — lazy-load admin routes), Pitfall 8 (stale form state between modal opens — unmount modals on close), Pitfall 6 (selector discipline in admin tables).

**Research flag:** Standard patterns — no research-phase needed.

### Phase 4: Customer Account + Polish

**Rationale:** My Orders requires auth (Phase 1) and order data (Phase 2 checkout creates orders). This phase also adds the loading/error state sweep across all pages, which is deliberately deferred to avoid premature polish before core flows are stable.

**Delivers:** My Orders page (auth-gated list of past orders), order detail view for customers, order status timeline (Ant Design Steps), loading skeletons on all data-fetch surfaces, global error boundary, responsive layout audit (375px mobile).

**Addresses features:** My Orders, order history, order tracking, loading states, error states, mobile polish.

**Must avoid:** Pitfall 9 (no global error boundary), Pitfall 17 (missing SPA catch-all for static hosting).

**Deployment tasks:** Nginx `try_files` SPA catch-all, Vite `base` path for sub-directory hosting, bundle analysis with vite-bundle-visualizer, `.env.production` secrets audit.

**Research flag:** Standard patterns — no research-phase needed.

### Phase Ordering Rationale

- Foundation first because 3 of 5 critical pitfalls are interceptor/auth/router bugs that are 10x harder to fix after features are built on top of them.
- Customer flow before admin because admin needs product and order data that only exists after the customer flow creates it; also, the product API types established in Phase 2 are reused by the admin panel.
- Account features last because My Orders is read-only (no new API surface), and polish/error states are correctly applied after all pages exist.
- WhatsApp/Zalo button promoted from "Differentiator" to Phase 2 based on low effort + high value for the niche audience.
- Sales dashboard chart deferred to v2 because it requires a backend aggregation endpoint and charting library that adds scope without unblocking the core purchase loop.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Backend auth contract must be established before coding. Confirm: Laravel package (Sanctum vs. Tymon), `/api/auth/login` response shape, whether refresh token endpoint exists, cookie vs. Bearer token strategy. Block sprint until confirmed.
- **Phase 3:** Image upload strategy needs backend confirmation — does the Laravel API accept multipart form data directly, or does it return signed S3 URLs for direct upload? This affects the `productApi.create()` implementation.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Product listing, cart, checkout with COD are industry-standard patterns; no novel integration required.
- **Phase 4:** My Orders and error boundary patterns are well-documented in React ecosystem.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major packages are stable, versioned, and within training data. One exception: `@ant-design/plots` v2 — verify this package version against AntD 5.x changelog before using. |
| Features | HIGH | E-commerce patterns are well-established. Vietnamese COD/Zalo market context is MEDIUM — validate with project owner that COD-only and no email notifications are correct for v1. |
| Architecture | HIGH | All patterns sourced from stable, official documentation. Folder structure is convention, not standard — team can deviate if needed. |
| Pitfalls | MEDIUM | External tools were unavailable during pitfall research. All 18 pitfalls are based on training knowledge of stable library APIs. Core patterns (race condition, XSS, CORS) are industry-standard and HIGH confidence. |

**Overall confidence:** HIGH

### Gaps to Address

- **Laravel auth package:** Not confirmed in research. Which package (Sanctum SPA, Sanctum API token, or Tymon JWT) determines the entire `axiosInstance` interceptor design. Must be resolved before Phase 1 sprint begins.
- **Image upload endpoint:** Whether product images go to Laravel directly (multipart) or via signed cloud storage URL affects `productApi` implementation in Phase 3. Clarify with backend team.
- **Exact package versions as of March 2026:** Training data cutoff is August 2025. Run `npm view react version`, `npm view antd version`, `npm view vite version` before bootstrapping to confirm current patch versions. Use `^` semver ranges to get latest minors automatically.
- **@ant-design/plots v2 currency:** LOW confidence on this specific package. Verify it still tracks AntD v5 design tokens before including it in the scaffold.

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — full technology stack with rationale and alternatives (training knowledge, cutoff Aug 2025)
- `.planning/research/FEATURES.md` — feature table stakes, differentiators, anti-features, dependency tree
- `.planning/research/ARCHITECTURE.md` — folder structure, component boundary rules, data flow diagrams, 6 key patterns with code
- `.planning/research/PITFALLS.md` — 18 pitfalls across critical/moderate/minor severity with phase-specific warnings

### Secondary (MEDIUM confidence)
- Project context: `.planning/PROJECT.md` — pre-confirmed stack decisions, scope constraints (no SSR, no i18n, no payment gateway v1)
- Vietnamese e-commerce market context (COD dominance, Zalo preference) — training knowledge as of 2024; validate with team

### Tertiary (LOW confidence)
- `@ant-design/plots` v2 version currency — not verifiable without live npm registry; check before use
- ESLint 9 flat config ecosystem adoption — was mixed in mid-2024; verify plugin compatibility before committing to flat config

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
