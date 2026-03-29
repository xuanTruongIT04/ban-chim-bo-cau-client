---
phase: 02-customer-purchase-flow
plan: 03
subsystem: ui
tags: [react, antd, tanstack-query, cart, customer-ui]

# Dependency graph
requires:
  - phase: 02-customer-purchase-flow
    plan: 01
    provides: useCart, useUpdateCartItem, useRemoveCartItem hooks, CartData/CartItemResource types

provides:
  - CartPage with item list, quantity controls, order summary, and empty/loading states
  - CartItemRow component with debounced quantity update and remove button
  - CustomerLayout with header cart badge from backend cart data

affects: [02-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Debounce pattern: useRef<ReturnType<typeof setTimeout>> + clearTimeout on each change + 500ms delay"
    - "CartItemRow is a pure presentational component — all state/mutations managed by CartPage"
    - "formatVND utility wraps Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })"

key-files:
  created:
    - src/utils/format.ts
    - src/components/customer/CartItemRow.tsx
    - src/pages/customer/CartPage.tsx
  modified:
    - src/layouts/CustomerLayout.tsx

key-decisions:
  - "formatVND placed in src/utils/format.ts as shared utility for all price formatting across customer UI"
  - "CartItemRow uses local useRef debounce (not lodash/debounce) to avoid introducing a new dependency"
  - "CustomerLayout reads cart count from useCart() TanStack Query instead of Zustand store — ensures badge updates on all cart mutations"

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 02 Plan 03: Cart Page — View, Update Quantities, Remove Items

**CartPage with debounced quantity updates, remove buttons, and header badge wired to backend cart data via TanStack Query**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-29T04:23:44Z
- **Completed:** 2026-03-29T04:25:27Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `src/utils/format.ts` with `formatVND()` using `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Created `CartItemRow` component with 500ms debounced quantity update using `useRef<ReturnType<typeof setTimeout>>` pattern
- Created `CartPage` with two-column layout (items + summary), loading/empty states, backend-computed total
- Updated `CustomerLayout` to replace `useCartStore(s => s.items.length)` with `useCart()` hook for accurate badge count

## Task Commits

1. **Task 1: CartItemRow, CartPage, and formatVND utility** — `ae5f897` (feat)
2. **Task 2: Update CustomerLayout cart badge to backend data** — `cb2512e` (feat)

## Files Created/Modified

- `src/utils/format.ts` — `formatVND(amount: number): string` using Vietnamese locale
- `src/components/customer/CartItemRow.tsx` — list item with debounced InputNumber, subtotal display, and danger delete button
- `src/pages/customer/CartPage.tsx` — full cart page: Spin loading, Empty state, two-column Row/Col layout, List of CartItemRows, order summary Card
- `src/layouts/CustomerLayout.tsx` — replaced `useCartStore` badge with `useCart()` data

## Decisions Made

- **formatVND in utils/format.ts:** Shared utility rather than inline — CartPage and future ProductListPage/CheckoutPage all need VND formatting. Avoids duplicated Intl.NumberFormat instantiation.
- **CartItemRow with local debounce:** Using `useRef` + `setTimeout` avoids adding lodash or a debounce utility dependency. The 500ms delay prevents excessive PATCH requests as users type in InputNumber.
- **No confirmation modal for remove:** Per UI-SPEC.md and plan spec, cart item removal is low-stakes and can be re-added; direct DELETE with no modal is correct.
- **Backend total, not frontend sum:** `cart.total_amount` (backend-computed) used for the summary total — no `price * quantity` calculation on the frontend.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing src/utils/format.ts**
- **Found during:** Task 1 (both CartItemRow and CartPage import `formatVND` from `../../utils/format`)
- **Issue:** `src/utils/format.ts` did not exist; plan referenced it in context interfaces but no prior plan created it
- **Fix:** Created `src/utils/format.ts` with `formatVND()` using `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- **Files modified:** src/utils/format.ts (new)
- **Commit:** ae5f897

---

**Total deviations:** 1 auto-fixed (missing blocking dependency)

## Issues Encountered

Pre-existing test failures (7 tests in `authApi.test.ts` and `authStore.test.ts`) remain from Phase 01 — these were already logged in `deferred-items.md` by plan 02-01 and are unrelated to this plan's changes. No new test failures introduced.

## Self-Check: PASSED

Files verified:
- src/utils/format.ts — FOUND
- src/components/customer/CartItemRow.tsx — FOUND
- src/pages/customer/CartPage.tsx — FOUND (updated CustomerLayout)
- src/layouts/CustomerLayout.tsx — FOUND (updated)

Commits verified:
- ae5f897 — FOUND
- cb2512e — FOUND

---
*Phase: 02-customer-purchase-flow*
*Completed: 2026-03-29*
