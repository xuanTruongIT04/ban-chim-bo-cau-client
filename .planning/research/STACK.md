# Technology Stack

**Project:** Bán Chim Bồ Câu — React SPA Frontend
**Researched:** 2026-03-28
**Confidence note:** Training data cutoff August 2025. All version ranges are the latest stable as of that date. Verify exact patch versions via `npm view <package> version` before bootstrapping. Semver minors in this stack are stable — no major breaking changes expected in the 6-month gap.

---

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

**React 19 deferral rationale:** React 19 introduced Server Components as a first-class API, the `use()` hook, and ref-as-prop. None of these are needed for a pure SPA. The risk of ecosystem friction (Ant Design peer-dep warnings, undiscovered breaking changes in hooks) outweighs the benefit. Revisit at v2 when ecosystem matures.

### Routing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-router-dom | ^6.26 | Client-side routing | v6 is stable, mature, and purpose-built for SPA routing without SSR complexity; `createBrowserRouter` with `loader`/`action` pattern is clean for data-fetching per route; do NOT use the old `<Switch>` v5 API |

**Do not use:** TanStack Router — well-engineered but adds complexity and team learning cost with no meaningful benefit over RRv6 for this project scope.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zustand | ^5.0 | Global client state | v5 (released Oct 2024) dropped legacy `immer` defaults and has a cleaner API; perfect for: auth state, cart contents, UI state; minimal boilerplate vs Redux Toolkit; works without `Provider` wrapping |

**Zustand usage boundary:** Only use Zustand for truly global, persistent state (auth token, cart). Use React `useState`/`useReducer` for component-local state. Using Zustand for everything is a common anti-pattern.

**Do not use:** Redux Toolkit — correct tool but 3x the boilerplate for this project's scale. Jotai — atomic model is elegant but the team is already aligned on Zustand.

### Server State / Data Fetching

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack Query (react-query) | ^5.51 | Server state, caching, loading/error states | This is a **strong recommendation** even though not in the original stack spec. TanStack Query v5 handles the patterns the project requires: loading states, error handling, cache invalidation after mutations (adding product, placing order). Without it, you will hand-roll these patterns repeatedly with useEffect + useState, which is a well-documented source of bugs in React. The alternative is significant duplicated code. |
| axios | ^1.7 | HTTP client | Used as the transport layer for TanStack Query and direct calls; `axios.create()` for a base instance with interceptors for JWT injection and 401 handling |

**TanStack Query vs raw Axios:** Axios handles transport (requests/responses, interceptors). TanStack Query handles server state lifecycle (caching, background refetch, stale-while-revalidate, mutation state). They complement each other — use both.

**Do not use:** SWR — less featureful than TanStack Query v5 for mutations/optimistic updates. fetch() directly — loses interceptor-based auth injection.

### UI Component Library

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| antd | ^5.20 | UI component library | Ant Design 5 uses CSS-in-JS (Emotion-based), has zero global stylesheet pollution, and ships production-ready: Table (server-side pagination), Form (validation), Modal, Drawer, DatePicker, Upload. The admin panel requirements (product/order tables, forms) justify this choice — building equivalent components from scratch would consume 3–4 phases |
| @ant-design/icons | ^5.4 | Icon set | Required companion to antd; tree-shakeable |
| @ant-design/plots | ^2.2 | Charts for dashboard | Built on AntV G2; integrates with AntD design tokens; use for the admin stats dashboard (total products, new orders). Alternative: recharts — lighter but requires more custom styling to match AntD aesthetics |

**Ant Design CSS-in-JS note:** AntD 5 does NOT require importing `antd/dist/reset.css` the way v4 did. Use `<ConfigProvider>` at the root to set theme tokens. Do not import the old v4 CSS approach.

**Do not use:** Material UI — different design language, would conflict aesthetically with AntD. shadcn/ui — requires more manual composition, no admin-grade Table or Form with built-in validation.

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (Ant Design Form) | built-in | Form state + validation | AntD `<Form>` with `rules` prop is sufficient for this project's forms (login, product create/edit, checkout). It uses `rc-field-form` internally and supports async validation. |
| zod | ^3.23 | Schema validation / type inference | Use Zod for: (1) validating API response shapes before consuming them, (2) defining shared TypeScript types from schemas. Do NOT use it to replace AntD Form rules — that creates two validation systems. Zod + AntD Form's `validator` function is the correct integration point if strict API validation is needed. |

**Do not use:** React Hook Form — excellent library but redundant when AntD Form already provides form state management. Using both creates conflicts.

### Authentication State

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zustand | (see above) | Auth state store | Store: `{ token, user, role, setAuth, clearAuth }`. Persist to `localStorage` via `zustand/middleware` `persist`. |
| (no JWT library needed) | — | Token decoding | JWT payload decode is just `atob(token.split('.')[1])` — no library needed for reading claims. Verification happens server-side only. |

**JWT refresh strategy:** Laravel Tymon JWT (the standard Laravel JWT package) issues tokens with configurable TTL and supports token refresh. Recommended approach: set a long TTL (7 days) for v1 to avoid refresh complexity; add an Axios response interceptor to catch 401 and redirect to `/login`. Implement proper refresh token rotation in v2.

### Development & Quality Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | ^9.0 | Linting | ESLint 9 introduced the flat config (`eslint.config.js`); use `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks`; flat config is simpler and the 2025 standard |
| typescript-eslint | ^8.0 | TypeScript ESLint integration | Replaces the old `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` split packages |
| Prettier | ^3.3 | Code formatting | Non-negotiable for team consistency; configure `eslint-config-prettier` to disable ESLint formatting rules that conflict |
| Vitest | ^2.1 | Unit testing | Same config as Vite; faster than Jest for Vite projects; `@testing-library/react` for component tests |
| @testing-library/react | ^16.0 | Component testing utilities | Works with Vitest; `render`, `screen`, `userEvent` |

**Do not use:** Jest — works but requires additional Babel/transform config that Vitest avoids. CRA (Create React App) — deprecated in 2023, community moved to Vite.

### Environment Configuration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (Vite built-in) | — | `.env` file handling | Vite natively reads `.env`, `.env.local`, `.env.production`; prefix all custom vars with `VITE_` to expose to the browser (e.g., `VITE_API_BASE_URL`). No `dotenv` library needed. |

---

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

---

## Project Structure Convention

```
src/
  api/          # axios instance, API function modules (products.ts, orders.ts, auth.ts)
  components/   # Reusable UI components (NOT page-specific)
  hooks/        # Custom hooks (useAuth, useCart)
  layouts/      # Route layout wrappers (AdminLayout, PublicLayout)
  pages/        # Page-level components mapped to routes
  stores/       # Zustand stores (authStore.ts, cartStore.ts)
  types/        # Shared TypeScript interfaces / Zod schemas
  utils/        # Pure utility functions
  main.tsx      # Entry point
  App.tsx        # Router config, QueryClientProvider, ConfigProvider
```

**Key principle:** `api/` holds only Axios calls (thin functions returning promises). `hooks/` wraps TanStack Query hooks around `api/` functions. `pages/` consumes hooks. This keeps pages clean and testable.

---

## Installation

```bash
# Bootstrap
npm create vite@latest ban-chim-bo-cau-client -- --template react-ts
cd ban-chim-bo-cau-client

# Core
npm install react@18 react-dom@18 react-router-dom zustand axios
npm install @tanstack/react-query
npm install antd @ant-design/icons @ant-design/plots
npm install zod

# Dev
npm install -D typescript@5 vite@6 @vitejs/plugin-react
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D eslint@9 typescript-eslint prettier eslint-config-prettier
```

---

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

---

## Sources

- Training knowledge (React, Vite, Zustand, RRv6, TanStack Query, AntD 5 documentation) — cutoff August 2025
- Project context: `.planning/PROJECT.md` — stack decisions pre-confirmed by project owner
- **Action required before scaffold:** Run `npm view react version`, `npm view antd version`, `npm view vite version` to confirm exact latest patch versions as of March 2026
