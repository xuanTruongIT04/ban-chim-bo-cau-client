---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 04
current_plan: 1
status: executing
last_updated: "2026-03-29T07:49:56.241Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 15
  completed_plans: 13
  percent: 87
---

# Project State: Bán Chim Bồ Câu — Frontend Client

**Last updated:** 2026-03-28
**Updated by:** Roadmap initialization

---

## Project Reference

**Core value:** Khách hàng có thể duyệt, chọn và đặt mua chim bồ câu dễ dàng (kể cả không cần đăng nhập); admin có thể quản lý toàn bộ hệ thống từ một giao diện.

**Stack:** Vite 6 + React 18 + TypeScript + Zustand 5 + TanStack Query + Ant Design 5 + React Router v6 + Axios

**Backend:** Laravel REST API (auth contract not yet confirmed — Sanctum vs. Tymon JWT)

---

## Current Position

Phase: 04 (account-polish) — EXECUTING
Plan: 2 of 3
**Current phase:** 04
**Current plan:** 1
**Status:** Ready to execute

**Progress:**

[█████████░] 87%
[          ] Phase 1: Foundation + Authentication   (0%)
[          ] Phase 2: Customer Purchase Flow        (0%)
[          ] Phase 3: Admin Panel                   (0%)
[          ] Phase 4: Account + Polish              (0%)

```

**Overall:** 0 of 4 phases complete

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases defined | 4 |
| Requirements mapped | 46/46 |
| Plans complete | 0 |
| Plans in progress | 0 |

---
| Phase 01 P02 | 5 | 2 tasks | 7 files |
| Phase 01 P03 | 260 | 2 tasks | 12 files |
| Phase 02 P01 | 3 | 2 tasks | 14 files |
| Phase 02 P02 | 15 | 2 tasks | 6 files |
| Phase 02 P03 | 2 | 2 tasks | 4 files |
| Phase 02 P04 | 30 | 3 tasks | 3 files |
| Phase 03 P03 | 660 | 2 tasks | 4 files |
| Phase 03 P02 | 3 | 3 tasks | 6 files |
| Phase 03 P04 | checkpoint | 1 tasks | 0 files |
| Phase 04 P01 | 5 | 2 tasks | 7 files |

## Accumulated Context

### Decisions Made

| Decision | Rationale | Phase |
|----------|-----------|-------|
| 4-phase coarse structure | Research confirms natural delivery boundaries: infrastructure → purchase flow → admin → polish | Pre-Phase 1 |
| UX requirements in Phase 4 | Polish sweep is correctly applied after all feature surfaces exist | Pre-Phase 1 |
| ACCOUNT requirements in Phase 4 | My Orders requires both auth (Phase 1) and order data (Phase 2 creates orders) | Pre-Phase 1 |
| Admin panel in Phase 3 | Admin depends on product/order API types established in Phase 2 | Pre-Phase 1 |

- [Phase 01]: isRefreshing module-level flag prevents concurrent 401s from triggering multiple redirect/clearAuth cycles
- [Phase 01]: partialize: token only — user and isInitializing always rehydrate fresh from API (D-31)
- [Phase 01]: 422 responses not globally intercepted — pass through to call-site handlers (FOUND-05)
- [Phase 01]: authApi stub created in Plan 03 to unblock AdminLayout logout wiring; Plan 04 replaces with full implementation
- [Phase 01]: setNavigator registered in both AdminLayout and CustomerLayout useEffect so navigation service works across all route sections
- [Phase 02]: cartStore persists only cartToken (not items) — cart data lives in backend, token is the identity key
- [Phase 02]: CART_TOKEN_REQUIRED and CART_NOT_FOUND 401s skip admin login redirect — cart errors are separate from auth errors
- [Phase 02]: useCategories degrades gracefully to empty array on 401 — guest product browsing works without auth
- [Phase 02]: Client-side search only searches current page — server-side search would require API support not in scope
- [Phase 02]: CategoryFilter flattens parent+children into flat Select list for simplicity
- [Phase 02]: formatVND placed in src/utils/format.ts as shared utility for all price formatting across customer UI
- [Phase 02]: CustomerLayout badge reads cart count from useCart() TanStack Query instead of Zustand store
- [Phase 02]: Note field shown in checkout form but intentionally excluded from CheckoutPayload — backend has no note field per RESEARCH.md gap
- [Phase 02]: OrderConfirmationPage uses useLocation().state to receive order data — avoids extra GET /orders/:id API call after checkout
- [Phase 03]: OrderStatusButtons returns null for terminal statuses — cleaner than disabled buttons
- [Phase 03]: Cancel uses separate useCancelOrder hook (POST /cancel) — not updateStatus with huy value
- [Phase 03]: PlaceholderPage import removed from router — all admin routes now have real page components
- [Phase 03]: ProductImageUpload uses customRequest (not action URL) to avoid Content-Type header issues with multipart/form-data
- [Phase 03]: Admin panel verified end-to-end by human against live backend — Phase 3 requirements APROD-01-05, AORD-01-03, DASH-01, DASH-03 all confirmed working
- [Phase 04]: Order history stored in localStorage via Zustand persist — backend has no public order lookup endpoint for guests
- [Phase 04]: Revenue calculated client-side by fetching hoan_thanh orders and summing total_amount — dashboard stats API lacks revenue field
- [Phase 04]: Max 20 orders kept in history with deduplication by id — prevents unbounded localStorage growth

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

Roadmap initialized from requirements and research. ROADMAP.md written with 4-phase structure covering all 46 v1 requirements. STATE.md created. REQUIREMENTS.md traceability section verified.

### What Comes Next

Run `/gsd:plan-phase 1` to decompose Phase 1 into executable plans.
Before planning Phase 1: resolve the Laravel auth contract blocker listed above.

### Context Warnings

- Backend API docs do not yet exist — contracts must be defined in parallel with Phase 1 development
- React 18.3 is pinned (not 19) due to Ant Design 5.x peer-dependency constraints; do not upgrade React until AntD explicitly supports v19
- ESLint 9 flat config ecosystem adoption was mixed as of mid-2024; verify plugin compatibility before committing

---

*State initialized: 2026-03-28*
