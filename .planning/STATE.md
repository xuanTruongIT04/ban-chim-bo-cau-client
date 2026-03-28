# Project State: Bán Chim Bồ Câu — Frontend Client

**Last updated:** 2026-03-28
**Updated by:** Plan 01-01 execution

---

## Project Reference

**Core value:** Khách hàng có thể duyệt, chọn và đặt mua chim bồ câu dễ dàng (kể cả không cần đăng nhập); admin có thể quản lý toàn bộ hệ thống từ một giao diện.

**Stack:** Vite 6 + React 18 + TypeScript + Zustand 5 + TanStack Query + Ant Design 5 + React Router v6 + Axios

**Backend:** Laravel REST API (auth contract not yet confirmed — Sanctum vs. Tymon JWT)

---

## Current Position

**Current phase:** Phase 1 — Foundation + Authentication
**Current plan:** Plan 02 of 4 (01-01 complete)
**Status:** In Progress

**Progress:**
```
[==        ] Phase 1: Foundation + Authentication   (25% — 1/4 plans)
[          ] Phase 2: Customer Purchase Flow        (0%)
[          ] Phase 3: Admin Panel                   (0%)
[          ] Phase 4: Account + Polish              (0%)
```

**Overall:** 0 of 4 phases complete (1 plan done)

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases defined | 4 |
| Requirements mapped | 46/46 |
| Plans complete | 1 |
| Plans in progress | 0 |

---

## Accumulated Context

### Decisions Made

| Decision | Rationale | Phase |
|----------|-----------|-------|
| 4-phase coarse structure | Research confirms natural delivery boundaries: infrastructure → purchase flow → admin → polish | Pre-Phase 1 |
| UX requirements in Phase 4 | Polish sweep is correctly applied after all feature surfaces exist | Pre-Phase 1 |
| ACCOUNT requirements in Phase 4 | My Orders requires both auth (Phase 1) and order data (Phase 2 creates orders) | Pre-Phase 1 |
| Admin panel in Phase 3 | Admin depends on product/order API types established in Phase 2 | Pre-Phase 1 |
| React 18.3 pinned (not 19) | AntD 5.x peer-dep constraint; do not upgrade until AntD explicitly supports React 19 | Phase 1, Plan 01 |
| Vitest separate config file | vitest.config.ts avoids glob exclusion conflicts with vite.config.ts | Phase 1, Plan 01 |
| Smoke test added to test infra | vitest exits code 1 with no test files; smoke test ensures CI-safe baseline | Phase 1, Plan 01 |

### Critical Blockers (Must Resolve Before Phase 1)

- **Laravel auth contract undefined:** Must confirm Sanctum vs. Tymon JWT, `POST /api/auth/login` response shape, refresh token endpoint existence, and cookie vs. Bearer token strategy with backend team before writing any interceptor code
- **JWT storage strategy:** Decide on access token in Zustand memory only + `httpOnly` cookie for refresh token (requires backend cooperation) vs. full localStorage — affects XSS risk profile
- **Image upload endpoint (Phase 3 pre-work):** Confirm whether product images are accepted as multipart form data directly or via signed cloud storage URLs

### Known Pitfalls (From Research)

- Axios interceptor token refresh race condition — implement `isRefreshing` request queue in `axiosInstance.ts` from day one
- Protected route flicker — add `isInitializing: true` to auth store and render `<PageLoader>` until initialization completes
- Zustand store over-subscription — always use selector functions, never subscribe to whole store
- AntD bundle bloat — lazy-load admin routes (Phase 3)
- Stale AntD modal/form state — unmount modals on close, not hide
- Cart lost on refresh — CART-05/FOUND-08 require Zustand `persist` middleware; verify this is wired from the start

### Todos

- [ ] Confirm Laravel auth contract with backend before Phase 1 planning
- [ ] Agree on JWT storage strategy (memory vs. localStorage) before Phase 1 sprint
- [ ] Verify `@ant-design/plots` v2 currency against AntD 5.x changelog before Phase 3
- [ ] Run `npm view react version` / `npm view antd version` / `npm view vite version` before scaffold to confirm current patch versions (training cutoff Aug 2025)

### Blockers

None active (project not yet started)

---

## Session Continuity

### What Was Done Last

Executed Plan 01-01: Scaffolded Vite 6 + React 18.3 + TypeScript project with all production and dev dependencies, clean architecture folder structure, multi-environment configuration, shared TypeScript API types (matching Laravel auth contract), and Vitest test infrastructure. Build and tests pass.

**Commits:**
- `8cda044` feat(01-01): scaffold Vite 6 + React 18 project with clean architecture
- `6991dc6` feat(01-01): add env config, shared API types, and test infrastructure

### What Comes Next

Execute Plan 01-02: Axios instance with interceptors, auth store (Zustand), cart store, navigation service, AntD theme config.

### Context Warnings

- Backend API docs do not yet exist — contracts must be defined in parallel with Phase 1 development
- React 18.3 is pinned (not 19) due to Ant Design 5.x peer-dependency constraints; do not upgrade React until AntD explicitly supports v19
- ESLint 9 flat config ecosystem adoption was mixed as of mid-2024; verify plugin compatibility before committing

---

*State initialized: 2026-03-28*
