---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 01
current_plan: 1
status: executing
last_updated: "2026-03-28T11:04:53.497Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 3
  percent: 75
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

Phase: 01 (foundation-authentication) — EXECUTING
Plan: 3 of 4
**Current phase:** 01
**Current plan:** 1
**Status:** Ready to execute

**Progress:**

[████████░░] 75%
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
