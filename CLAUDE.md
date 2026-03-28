<!-- GSD:project-start source:PROJECT.md -->
## Project

**Bán Chim Bồ Câu — Frontend Client**

Ứng dụng frontend React production-ready cho hệ thống bán chim bồ câu trực tuyến. Giao tiếp với backend Laravel qua RESTful API. Gồm hai phần: giao diện khách hàng (xem sản phẩm, giỏ hàng, đặt hàng) và giao diện quản trị nội bộ (quản lý sản phẩm, đơn hàng, dashboard).

**Core Value:** Khách hàng có thể duyệt, chọn và đặt mua chim bồ câu dễ dàng; admin có thể quản lý toàn bộ hệ thống từ một giao diện duy nhất.

### Constraints

- **Tech Stack**: Vite (không phải Next.js) — không cần SSR/SEO
- **UI Library**: Ant Design — admin tables/forms sẵn có, tiết kiệm thời gian
- **State Management**: Zustand — nhẹ, ít boilerplate, phù hợp quy mô dự án
- **API**: Phải align với Laravel backend; chưa có docs → cần define contract khi build
- **Auth**: JWT token từ Laravel; cần refresh token strategy hoặc re-login on expiry
- **Dependencies**: Backend Laravel phải chạy trước khi frontend có thể test API thật
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Runtime
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 20 LTS (≥20.11) | Build toolchain runtime | LTS track guarantees long-term stability; Vite 6 requires Node 18+; 20 LTS is the safe floor for 2025 production |
| TypeScript | ^5.5 | Type-safe development | 5.5 added type narrowing improvements and inferred type predicates; no breaking changes from 5.x; use `strict: true` |
### Bundler & Dev Server
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | ^6.0 | Build tool, dev server, HMR | Vite 6 (released Nov 2024) is the 2025 default; significantly faster cold starts than Webpack; first-class React support via `@vitejs/plugin-react`; no config needed for most setups |
| @vitejs/plugin-react | ^4.3 | Babel-based React fast refresh | Pairs with Vite 6; use the Babel variant (not SWC) unless you specifically need SWC speed at scale — Babel variant has better ecosystem compatibility for this project size |
### UI Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | ^18.3 | UI rendering | React 19 was released December 2024 but its ecosystem (Ant Design, router integrations) still lag on full 19 support as of early 2025; React 18.3 is the production-safe choice for Ant Design 5.x compatibility. Do NOT upgrade to 19 until Ant Design explicitly supports it. |
| react-dom | ^18.3 | DOM renderer | Must match React version exactly |
### Routing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-router-dom | ^6.26 | Client-side routing | v6 is stable, mature, and purpose-built for SPA routing without SSR complexity; `createBrowserRouter` with `loader`/`action` pattern is clean for data-fetching per route; do NOT use the old `<Switch>` v5 API |
### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zustand | ^5.0 | Global client state | v5 (released Oct 2024) dropped legacy `immer` defaults and has a cleaner API; perfect for: auth state, cart contents, UI state; minimal boilerplate vs Redux Toolkit; works without `Provider` wrapping |
### Server State / Data Fetching
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack Query (react-query) | ^5.51 | Server state, caching, loading/error states | This is a **strong recommendation** even though not in the original stack spec. TanStack Query v5 handles the patterns the project requires: loading states, error handling, cache invalidation after mutations (adding product, placing order). Without it, you will hand-roll these patterns repeatedly with useEffect + useState, which is a well-documented source of bugs in React. The alternative is significant duplicated code. |
| axios | ^1.7 | HTTP client | Used as the transport layer for TanStack Query and direct calls; `axios.create()` for a base instance with interceptors for JWT injection and 401 handling |
### UI Component Library
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| antd | ^5.20 | UI component library | Ant Design 5 uses CSS-in-JS (Emotion-based), has zero global stylesheet pollution, and ships production-ready: Table (server-side pagination), Form (validation), Modal, Drawer, DatePicker, Upload. The admin panel requirements (product/order tables, forms) justify this choice — building equivalent components from scratch would consume 3–4 phases |
| @ant-design/icons | ^5.4 | Icon set | Required companion to antd; tree-shakeable |
| @ant-design/plots | ^2.2 | Charts for dashboard | Built on AntV G2; integrates with AntD design tokens; use for the admin stats dashboard (total products, new orders). Alternative: recharts — lighter but requires more custom styling to match AntD aesthetics |
### Forms & Validation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (Ant Design Form) | built-in | Form state + validation | AntD `<Form>` with `rules` prop is sufficient for this project's forms (login, product create/edit, checkout). It uses `rc-field-form` internally and supports async validation. |
| zod | ^3.23 | Schema validation / type inference | Use Zod for: (1) validating API response shapes before consuming them, (2) defining shared TypeScript types from schemas. Do NOT use it to replace AntD Form rules — that creates two validation systems. Zod + AntD Form's `validator` function is the correct integration point if strict API validation is needed. |
### Authentication State
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zustand | (see above) | Auth state store | Store: `{ token, user, role, setAuth, clearAuth }`. Persist to `localStorage` via `zustand/middleware` `persist`. |
| (no JWT library needed) | — | Token decoding | JWT payload decode is just `atob(token.split('.')[1])` — no library needed for reading claims. Verification happens server-side only. |
### Development & Quality Tools
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | ^9.0 | Linting | ESLint 9 introduced the flat config (`eslint.config.js`); use `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks`; flat config is simpler and the 2025 standard |
| typescript-eslint | ^8.0 | TypeScript ESLint integration | Replaces the old `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` split packages |
| Prettier | ^3.3 | Code formatting | Non-negotiable for team consistency; configure `eslint-config-prettier` to disable ESLint formatting rules that conflict |
| Vitest | ^2.1 | Unit testing | Same config as Vite; faster than Jest for Vite projects; `@testing-library/react` for component tests |
| @testing-library/react | ^16.0 | Component testing utilities | Works with Vitest; `render`, `screen`, `userEvent` |
### Environment Configuration
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (Vite built-in) | — | `.env` file handling | Vite natively reads `.env`, `.env.local`, `.env.production`; prefix all custom vars with `VITE_` to expose to the browser (e.g., `VITE_API_BASE_URL`). No `dotenv` library needed. |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Bundler | Vite 6 | Webpack 5 | 5–10x slower cold starts; no HMR advantage; no reason to use Webpack for greenfield 2025 |
| State | Zustand 5 | Redux Toolkit | RTK is correct at scale; 3x boilerplate for this scope; Zustand covers the need |
| State | Zustand 5 | Jotai | Atomic model is fine but team is already aligned on Zustand; no migration benefit |
| Routing | React Router v6 | TanStack Router | RRv6 is simpler and fully sufficient for this project; TanStack Router's type-safe route params are overkill |
| Data fetching | TanStack Query | SWR | TanStack Query v5 has better mutation handling, devtools, and TypeScript inference |
| UI | Ant Design 5 | MUI (Material UI) | Different design language; AntD has stronger admin panel components (Table with server pagination, tree selects) |
| UI | Ant Design 5 | shadcn/ui | shadcn requires manual composition; no admin-grade Table or Form |
| Forms | AntD Form + Zod | React Hook Form | RHF is excellent but redundant alongside AntD Form; two form state systems conflict |
| Charts | @ant-design/plots | recharts | AntD/plots integrates with AntD theme tokens; recharts needs manual theming to match |
| Testing | Vitest | Jest | Vitest shares Vite config; no extra transform setup needed |
| React version | React 18.3 | React 19 | AntD 5.x peer-dep compatibility; no SPA benefit from React 19 features |
## Project Structure Convention
## Installation
# Bootstrap
# Core
# Dev
## Confidence Assessment
| Package | Confidence | Notes |
|---------|------------|-------|
| Vite 6 | HIGH | Stable release Nov 2024; well within training data |
| React 18.3 | HIGH | Known stable; deferral of React 19 is a deliberate risk-reduction choice |
| React Router v6.26 | HIGH | Stable for 2+ years; no breaking changes expected |
| Zustand 5 | HIGH | Released Oct 2024; stable API |
| TanStack Query 5 | HIGH | Released Oct 2023; one year stable track record |
| Ant Design 5.20 | MEDIUM | Major version (v5) stable; exact minor may be higher by March 2026 — verify with `npm view antd version` |
| TypeScript 5.5 | MEDIUM | 5.5 released June 2024; 5.6–5.8 may exist by March 2026 — safe to use `^5.5` which resolves latest minor |
| ESLint 9 flat config | MEDIUM | Released April 2024; ecosystem adoption was mixed in mid-2024 — verify plugin compatibility before committing to flat config |
| @ant-design/plots v2 | LOW | Verify this package still tracks AntD v5 design tokens; check release date vs AntD 5.x changelog |
## Sources
- Training knowledge (React, Vite, Zustand, RRv6, TanStack Query, AntD 5 documentation) — cutoff August 2025
- Project context: `.planning/PROJECT.md` — stack decisions pre-confirmed by project owner
- **Action required before scaffold:** Run `npm view react version`, `npm view antd version`, `npm view vite version` to confirm exact latest patch versions as of March 2026
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
