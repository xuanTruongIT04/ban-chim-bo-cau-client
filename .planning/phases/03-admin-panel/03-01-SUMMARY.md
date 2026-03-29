---
phase: 03-admin-panel
plan: 01
subsystem: admin-api-layer
tags: [api, hooks, tanstack-query, types, admin]
dependency_graph:
  requires:
    - "02-04: OrderResource, ProductResource types established in src/types/api.ts"
    - "01-02: axiosInstance with Bearer token interceptor"
  provides:
    - "adminProductApi: CRUD, image upload, stock adjustments for all product admin pages"
    - "adminOrderApi: list, detail, status update, cancel for order management page"
    - "adminDashboardApi: stats fetch for dashboard page"
    - "adminCategoryApi: category list for product form dropdowns"
    - "useAdminProducts/useAdminProduct/useCreateProduct/useUpdateProduct/useDeleteProduct/useUploadProductImage/useDeleteProductImage/useAdjustStock"
    - "useAdminOrders/useAdminOrder/useUpdateOrderStatus/useCancelOrder"
    - "useAdminDashboard"
  affects:
    - "03-02: Admin Dashboard page consumes useAdminDashboard"
    - "03-03: Admin Products page consumes useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct"
    - "03-04: Admin Orders page consumes useAdminOrders, useUpdateOrderStatus, useCancelOrder"
tech_stack:
  added: []
  patterns:
    - "adminProductApi/adminOrderApi/adminDashboardApi: named exports following productApi.ts pattern"
    - "useAdminProducts/etc: TanStack Query hooks following useProducts.ts / useCart.ts pattern"
    - "TDD: tests written before implementation; RED then GREEN"
key_files:
  created:
    - src/api/admin/adminProductApi.ts
    - src/api/admin/adminOrderApi.ts
    - src/api/admin/adminDashboardApi.ts
    - src/api/admin/adminCategoryApi.ts
    - src/api/admin/__tests__/adminProductApi.test.ts
    - src/api/admin/__tests__/adminOrderApi.test.ts
    - src/api/admin/__tests__/adminDashboardApi.test.ts
    - src/hooks/admin/useAdminProducts.ts
    - src/hooks/admin/useAdminOrders.ts
    - src/hooks/admin/useAdminDashboard.ts
  modified:
    - src/types/api.ts
decisions:
  - "Order cancel uses POST /admin/orders/{id}/cancel not PATCH /status with 'huy' — separate endpoint per openapi spec"
  - "Image upload: FormData without manual Content-Type header — axios auto-detects multipart/form-data boundary"
  - "Phase 2 types backfilled into worktree api.ts — worktree only had Phase 1 types at start"
metrics:
  duration_seconds: 257
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_created: 10
  files_modified: 1
---

# Phase 3 Plan 1: Admin API Layer Summary

**One-liner:** Admin API layer with 4 typed modules (product/order/dashboard/category), 10 TanStack Query hooks with cache invalidation, and 24 unit tests via TDD.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Admin types + API modules with tests (TDD) | a070981 | src/types/api.ts, src/api/admin/*.ts, src/api/admin/__tests__/*.test.ts |
| 2 | TanStack Query hooks for all admin domains | 47250ab | src/hooks/admin/useAdminProducts.ts, useAdminOrders.ts, useAdminDashboard.ts |

## What Was Built

### Admin Types (src/types/api.ts)
Seven new interfaces appended to existing api.ts without modifying existing types:
- `AdminProductDetailResource` — extends ProductDetailResource with admin-specific fields
- `ProductImageResource` — image upload response shape
- `CreateProductPayload` — product create/update body
- `DashboardStats` — orders_by_status shape matching openapi spec
- `StockAdjustmentResource` — stock adjustment log entry
- `AdjustStockPayload` — stock adjustment request body
- `AdminOrderListParams` — filter/search/pagination params with bracket notation keys

### Admin API Modules (src/api/admin/)
Four modules following the productApi.ts pattern, all using the shared axiosInstance:

**adminProductApi:** 10 methods — list, getById, create, update, delete, toggleActive, uploadImage (FormData), setPrimaryImage, deleteImage, getStockAdjustments, adjustStock

**adminOrderApi:** 6 methods — list, getById, updateStatus, cancel (POST /cancel), confirmPayment, setDeliveryMethod

**adminDashboardApi:** 1 method — getStats returning DashboardStats

**adminCategoryApi:** 1 method — list returning CategoryResource[]

### TanStack Query Hooks (src/hooks/admin/)
Three hook files with 13 exported hooks total:

**useAdminProducts.ts:** useAdminProducts (keepPreviousData), useAdminProduct (enabled when id > 0), useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadProductImage, useDeleteProductImage, useAdjustStock — all mutations invalidate relevant query keys + show antd message toasts

**useAdminOrders.ts:** useAdminOrders (keepPreviousData), useAdminOrder (enabled when id > 0), useUpdateOrderStatus, useCancelOrder

**useAdminDashboard.ts:** useAdminDashboard (staleTime 60s)

### Unit Tests (24 tests passing)
TDD approach — tests written first (RED), then implementation (GREEN):
- adminProductApi: 14 tests covering all HTTP methods, URLs, payloads, FormData usage
- adminOrderApi: 8 tests including critical cancel endpoint verification
- adminDashboardApi: 2 tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Phase 2 types missing from worktree api.ts**
- **Found during:** Task 1 setup
- **Issue:** The worktree's src/types/api.ts only contained Phase 1 auth types (25 lines). Phase 2 types (ProductResource, OrderResource, CartData, etc.) were committed to the main worktree but not merged into this agent's worktree. AdminProductDetailResource extends ProductDetailResource which would be missing.
- **Fix:** Rebuilt api.ts with all Phase 1 + Phase 2 types plus the new Phase 3 types. Types match the main branch src/types/api.ts exactly based on the plan context interface definitions.
- **Files modified:** src/types/api.ts
- **Commit:** a070981 (included in Task 1 commit)

## Verification Results

- `npx vitest run --reporter=verbose`: 53/53 tests pass (7 test files)
- `npx tsc --noEmit`: No TypeScript errors
- All API modules import from axiosInstance (not creating new axios instances)
- Image upload uses FormData without manual Content-Type header
- Order cancel confirmed as POST /admin/orders/{id}/cancel (not PATCH /status)

## Known Stubs

None — all API methods are fully wired to their respective endpoints. No placeholder data or empty returns that would prevent admin pages from functioning.

## Self-Check: PASSED

Files exist:
- FOUND: src/api/admin/adminProductApi.ts
- FOUND: src/api/admin/adminOrderApi.ts
- FOUND: src/api/admin/adminDashboardApi.ts
- FOUND: src/api/admin/adminCategoryApi.ts
- FOUND: src/api/admin/__tests__/adminProductApi.test.ts
- FOUND: src/api/admin/__tests__/adminOrderApi.test.ts
- FOUND: src/api/admin/__tests__/adminDashboardApi.test.ts
- FOUND: src/hooks/admin/useAdminProducts.ts
- FOUND: src/hooks/admin/useAdminOrders.ts
- FOUND: src/hooks/admin/useAdminDashboard.ts

Commits exist:
- FOUND: a070981 (feat(03-01): add admin types and API modules with tests)
- FOUND: 47250ab (feat(03-01): add TanStack Query hooks for all admin domains)
