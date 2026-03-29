---
phase: 04-account-polish
plan: 01
subsystem: ui
tags: [zustand, persist, localStorage, order-history, tanstack-query, antd]

# Dependency graph
requires:
  - phase: 02-customer-purchase-flow
    provides: OrderConfirmationPage and OrderResource types from checkout flow
  - phase: 03-admin-panel
    provides: adminOrderApi.list() and useAdminOrders pattern for revenue query
provides:
  - Zustand order history store persisting recent orders in localStorage
  - MyOrdersPage at /orders showing expandable order list with full detail
  - OrderConfirmationPage wired to save order to history on mount
  - Admin dashboard Doanh thu card showing revenue from completed orders
affects:
  - 04-02-account-polish: UX polish can now style MyOrdersPage and DashboardPage further

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zustand persist with partialize for selective localStorage persistence
    - Client-side revenue aggregation from filtered API data (DASH-02 workaround)
    - useLocation().state → Zustand store bridging for post-checkout persistence

key-files:
  created:
    - src/stores/orderHistoryStore.ts
    - src/pages/customer/MyOrdersPage.tsx
  modified:
    - src/pages/customer/OrderConfirmationPage.tsx
    - src/router/index.tsx
    - src/layouts/CustomerLayout.tsx
    - src/hooks/admin/useAdminOrders.ts
    - src/pages/admin/DashboardPage.tsx

key-decisions:
  - "Order history stored in localStorage via Zustand persist — backend has no public order lookup endpoint for guests"
  - "Revenue calculated client-side by fetching hoan_thanh orders and summing total_amount — dashboard stats API lacks revenue field"
  - "Max 20 orders kept in history with deduplication by id — prevents unbounded localStorage growth"

patterns-established:
  - "Pattern: orderHistoryStore prepends + deduplicates on addOrder, keeps max 20 via slice"
  - "Pattern: useCompletedOrdersRevenue uses TanStack Query select transform to aggregate data"

requirements-completed: [ACCOUNT-01, ACCOUNT-02, DASH-02]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 4 Plan 01: Order History + Dashboard Revenue Summary

**Zustand localStorage order history (MyOrdersPage at /orders) and client-side revenue aggregation card on admin dashboard**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-29T07:25:00Z
- **Completed:** 2026-03-29T07:44:58Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created `orderHistoryStore` with Zustand persist middleware — orders saved to `order-history` localStorage key, max 20 with deduplication
- Built `MyOrdersPage` with AntD expandable Table showing order status Tags, customer info, items breakdown, and clear history button with confirm
- Wired `OrderConfirmationPage` to call `addOrder` on mount so checkout success automatically saves to history
- Added `/orders` route and "Don hang" nav link with `OrderedListOutlined` icon in `CustomerLayout` header
- Added `useCompletedOrdersRevenue` hook that fetches completed orders and sums `total_amount` client-side (DASH-02 workaround for missing backend revenue stat)
- Added "Doanh thu" card to DashboardPage Row 2 with `formatVND`, loading spinner, and green value style

## Task Commits

Each task was committed atomically:

1. **Task 1: Order history store, MyOrdersPage, and checkout wiring** - `c3cc7d4` (feat)
2. **Task 2: Admin dashboard revenue card from completed orders** - `3f5efe5` (feat)

## Files Created/Modified
- `src/stores/orderHistoryStore.ts` - Zustand persist store for order history (max 20, dedup by id)
- `src/pages/customer/MyOrdersPage.tsx` - Order list with expandable rows showing customer info and items
- `src/pages/customer/OrderConfirmationPage.tsx` - Added useEffect to call addOrder on mount
- `src/router/index.tsx` - Added `/orders` route with lazy-loaded MyOrdersPage
- `src/layouts/CustomerLayout.tsx` - Added "Don hang" nav link with OrderedListOutlined icon
- `src/hooks/admin/useAdminOrders.ts` - Added `useCompletedOrdersRevenue` hook with TanStack Query select transform
- `src/pages/admin/DashboardPage.tsx` - Added "Doanh thu" Card in Row 2 using useCompletedOrdersRevenue

## Decisions Made
- Order history stored client-side only (localStorage via Zustand persist) because backend has no public order lookup endpoint — customers cannot authenticate to /api/admin/orders
- Revenue calculated client-side by fetching all hoan_thanh orders (`per_page: 9999`) and summing `parseFloat(order.total_amount)` — dashboard stats API endpoint returns only order counts, not revenue
- useLocation().state.order is the data source for addOrder — avoids a second GET /orders/:id API call after checkout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Both tasks executed cleanly. The pre-existing test failures in `.clone/worktrees/agent-a534c527` are in another agent's worktree and unrelated to this plan's changes.

## Known Stubs

None — all data is wired. MyOrdersPage reads from live Zustand store, revenue card uses live API data.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- ACCOUNT-01, ACCOUNT-02, DASH-02 requirements satisfied
- MyOrdersPage and DashboardPage revenue card ready for UX polish in Plan 02
- No blockers for Plan 02 (loading/error states polish)

---
*Phase: 04-account-polish*
*Completed: 2026-03-29*
