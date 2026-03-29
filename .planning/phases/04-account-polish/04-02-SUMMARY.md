---
phase: 04-account-polish
plan: 02
subsystem: ux-polish
tags: [loading-states, error-handling, form-validation, ux]
dependency_graph:
  requires: []
  provides: [UX-01, UX-02, UX-03]
  affects: [customer-pages, admin-pages, axiosInstance]
tech_stack:
  added: []
  patterns: [isError-Alert, isLoading-Spin, Result-error-with-retry, loading-Select]
key_files:
  created: []
  modified:
    - src/pages/customer/CheckoutPage.tsx
    - src/pages/customer/CartPage.tsx
    - src/components/customer/CategoryFilter.tsx
    - src/pages/admin/ProductsPage.tsx
    - src/pages/admin/OrdersPage.tsx
    - src/components/admin/OrderDetailDrawer.tsx
    - src/api/axiosInstance.ts
decisions:
  - "CartPage and CheckoutPage use Result component for error state with retry button — consistent with ProductDetailPage/HomePage pattern"
  - "ProductsPage and OrdersPage use Alert (not Result) for error state — table pages should show error inline above table, not replace whole page"
  - "OrderDetailDrawer uses Alert inline inside drawer — does not close drawer on error, allows retry"
  - "403 added to axiosInstance global interceptor — completes coverage of all significant HTTP error codes"
metrics:
  duration_minutes: 13
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_modified: 7
---

# Phase 4 Plan 2: UX Polish — Loading, Error, and Validation States Summary

**One-liner:** Systematic UX gap audit filling all loading/error/validation holes: Spin on CheckoutPage load, Result+retry on CartPage/CheckoutPage error, loading prop on CategoryFilter Select, Alert on ProductsPage/OrdersPage/OrderDetailDrawer error, and 403 global interceptor.

## What Was Built

A complete UX gap audit and fix sweep across all customer and admin pages, ensuring UX-01 (loading indicators), UX-02 (error feedback), and UX-03 (form validation) requirements are fully satisfied.

### Task 1: Customer Pages Loading/Error Fix

**CheckoutPage (GAP fixed):**
- Replaced `return null` during cart load with centered `<Spin size="large" />` (UX-01)
- Added `<Result status="error">` with retry button when useCart returns isError (UX-02)
- Added `refetch` destructuring from useCart

**CartPage (GAP fixed):**
- Added `isError` and `refetch` destructuring from useCart
- Added `<Result status="error">` block after loading check with retry button (UX-02)

**CategoryFilter (MINOR GAP fixed):**
- Destructure `isLoading` from `useCategories()`
- Pass `loading={isLoading}` to AntD Select (UX-01, native Select loading spinner)

**Unchanged (already good):**
- HomePage: already had `isError` Result with retry
- ProductDetailPage: already had Spin loading and Result 404 on error

### Task 2: Admin Pages Error State Fix

**ProductsPage (GAP fixed):**
- Added `isError` from useAdminProducts
- Added `<Alert type="error">` rendered above Table when API fails (UX-02)

**OrdersPage (GAP fixed):**
- Added `isError` from useAdminOrders
- Added `<Alert type="error">` rendered above filter controls when API fails (UX-02)

**OrderDetailDrawer (GAP fixed):**
- Added `isError` from useAdminOrder
- Added `<Alert type="error">` as third branch in loading/error/data conditional (UX-02)

**axiosInstance (403 coverage added):**
- Added 403 Forbidden handler: `message.error('Ban khong co quyen thuc hien thao tac nay.')` (UX-02)
- Completes error code coverage: 401, 403, 5xx handled globally; 422 pass-through preserved

**Unchanged (already good):**
- LoginPage: had email/password validation rules + inline Alert error display
- ProductFormModal: had rules for name, price, unit_type, category
- StockAdjustModal: had rules for delta, adjustment_type
- DashboardPage: had both Spin loading and Alert error states

## Acceptance Criteria Verification

- [x] CheckoutPage shows spinner while cart loads (not blank screen)
- [x] CartPage shows error state with retry on useCart failure
- [x] CategoryFilter shows loading indicator while categories fetch
- [x] All customer pages have both loading AND error states for every useQuery call
- [x] ProductsPage shows error Alert when API fails
- [x] OrdersPage shows error Alert when API fails
- [x] OrderDetailDrawer has both loading and error states
- [x] LoginPage has proper form validation rules with inline error messages (pre-existing)
- [x] 403 errors produce visible notification
- [x] All admin TanStack Query error states surfaced to user

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Task | Description |
|------|------|-------------|
| 965d022 | Task 1 | feat(04-02): fix loading/error states on customer pages |
| c552969 | Task 2 | feat(04-02): add error states to admin pages and 403 handling |

## Self-Check: PASSED

- [x] `src/pages/customer/CheckoutPage.tsx` — modified, contains Spin and Result
- [x] `src/pages/customer/CartPage.tsx` — modified, contains Result with refetch
- [x] `src/components/customer/CategoryFilter.tsx` — modified, loading prop added
- [x] `src/pages/admin/ProductsPage.tsx` — modified, Alert on isError
- [x] `src/pages/admin/OrdersPage.tsx` — modified, Alert on isError
- [x] `src/components/admin/OrderDetailDrawer.tsx` — modified, Alert on isError
- [x] `src/api/axiosInstance.ts` — modified, 403 handler added
- [x] All 74 tests pass after both tasks
- [x] Commits 965d022 and c552969 exist in git log
