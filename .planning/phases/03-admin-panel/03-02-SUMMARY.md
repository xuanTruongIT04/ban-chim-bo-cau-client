---
phase: "03"
plan: "02"
subsystem: admin-panel
tags: [dashboard, products, crud, image-upload, stock-management]
dependency_graph:
  requires: ["03-01"]
  provides: ["DashboardPage", "ProductsPage", "ProductFormModal", "ProductImageUpload", "StockAdjustModal"]
  affects: ["src/router/index.tsx"]
tech_stack:
  added: []
  patterns:
    - "AntD Table with server-side pagination"
    - "AntD Upload customRequest with FormData"
    - "Modal.confirm for delete confirmation"
    - "destroyOnClose to prevent stale form state"
    - "useQuery inline for category list in modal"
key_files:
  created:
    - src/pages/admin/ProductsPage.tsx
    - src/components/admin/ProductFormModal.tsx
    - src/components/admin/ProductImageUpload.tsx
    - src/components/admin/StockAdjustModal.tsx
  modified:
    - src/pages/admin/DashboardPage.tsx
    - src/router/index.tsx
decisions:
  - "PlaceholderPage import removed from router — all admin routes now have real page components"
  - "ProductImageUpload uses customRequest (not action URL) to avoid Content-Type header issues with multipart/form-data"
  - "Category list fetched inline in ProductFormModal via useQuery to keep component self-contained"
metrics:
  duration: "3 minutes"
  completed: "2026-03-29"
  tasks: 3
  files: 6
---

# Phase 03 Plan 02: Dashboard + Product Management Summary

**One-liner:** Dashboard with order-status stat cards and product stock split; full product CRUD with paginated table, create/edit modal, image upload via customRequest FormData, and stock adjustment.

---

## What Was Built

### Task 1: DashboardPage

Replaced the stub with a real dashboard consuming `useAdminDashboard` and `useAdminProducts`.

- **Row 1:** 5 order status cards (cho_xac_nhan, xac_nhan, dang_giao, hoan_thanh, huy) each with a `<Badge>` color indicator and `<Statistic>` component
- **Row 2:** "Don hang moi" summary card (cho_xac_nhan count) and a "San pham" card split into "Dang ban" (green) and "Het hang" (red) counts computed client-side via `parseFloat(stock_quantity)`
- Loading spinner centered while both queries load; AntD Alert shown on error

### Task 2: ProductsPage

Product management table with full CRUD controls:

- AntD `<Table rowKey="id">` with 6 columns: image thumbnail, name, price (formatVND), stock (parsed float), status (Tag green/red), actions
- Server-side pagination wired to `meta.current_page / meta.per_page / meta.total`
- "Them san pham" button with `PlusOutlined` opens create modal
- Edit button pre-fills modal with existing product data
- Delete uses `Modal.confirm` with `okType: 'danger'`
- Image and stock adjust buttons open respective modals

### Task 3: Components + Router

**ProductFormModal:** Create/edit product in `<Modal destroyOnClose>` with `Form.useForm()`. Fields: name (min 3), description, price (InputNumber with VND formatter), unit_type (Select), category_id (flattened tree from adminCategoryApi), stock_quantity (create only), is_active (Switch). Calls useCreateProduct or useUpdateProduct based on edit mode.

**ProductImageUpload:** Image management in a Modal. Uses AntD `<Upload listType="picture-card" customRequest>` — customRequest calls `adminProductApi.uploadImage(productId, file)` with FormData without manually setting Content-Type (lets axios detect multipart boundary). Validates file type (JPEG/PNG/WebP) and size (< 5MB) in `beforeUpload`. Shows existing images with "Set primary" and "Delete" (with confirm) actions.

**StockAdjustModal:** Simple stock adjustment form in `<Modal destroyOnClose>`. Fields: delta (InputNumber, positive=add/negative=subtract), adjustment_type (Select: nhap_hang/kiem_ke/hu_hong/khac), note (TextArea). Calls `useAdjustStock`.

**Router:** Replaced `PlaceholderPage title="San pham"` with `<ProductsPage />`. Removed unused `PlaceholderPage` import (the parallel Plan 03 agent had already replaced `/admin/orders` with `OrdersPage`).

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PlaceholderPage import removal**
- **Found during:** Task 3
- **Issue:** After wiring ProductsPage, parallel agent (Plan 03) had already replaced the orders placeholder with OrdersPage, making PlaceholderPage completely unused
- **Fix:** Removed the unused PlaceholderPage import to eliminate TypeScript warning (TS6133)
- **Files modified:** src/router/index.tsx
- **Commit:** 963b6d8

---

## Verification Results

- `npx tsc --noEmit` — PASSED (no TypeScript errors)
- `npx vitest run` — 416 tests pass; 7 failures are in `.claude/worktrees/agent-a534c527/` (another parallel agent's worktree, pre-existing, out of scope)
- All acceptance criteria grep checks passed for Tasks 1, 2, and 3

---

## Known Stubs

None — all data sources are wired to real API hooks. No placeholder or hardcoded values in rendered output.

---

## Self-Check: PASSED

Files created/exist:
- src/pages/admin/DashboardPage.tsx — FOUND
- src/pages/admin/ProductsPage.tsx — FOUND
- src/components/admin/ProductFormModal.tsx — FOUND
- src/components/admin/ProductImageUpload.tsx — FOUND
- src/components/admin/StockAdjustModal.tsx — FOUND

Commits:
- 9036977 feat(03-02): implement DashboardPage with order status stat cards and product stock split
- 3c61ec1 feat(03-02): implement ProductsPage with paginated table, delete confirmation, and action buttons
- 963b6d8 feat(03-02): add ProductFormModal, ProductImageUpload, StockAdjustModal, wire router
