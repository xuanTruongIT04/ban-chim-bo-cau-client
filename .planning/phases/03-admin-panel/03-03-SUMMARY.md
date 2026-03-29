---
phase: "03"
plan: "03"
subsystem: admin-orders
tags: [admin, orders, table, drawer, state-machine]
dependency_graph:
  requires: ["03-01"]
  provides: [admin-order-management, order-status-transitions]
  affects: [router]
tech_stack:
  added: []
  patterns: [antd-table-filters, antd-drawer-detail, forward-transition-state-machine, cancel-confirmation-modal]
key_files:
  created:
    - src/pages/admin/OrdersPage.tsx
    - src/components/admin/OrderDetailDrawer.tsx
    - src/components/admin/OrderStatusButtons.tsx
  modified:
    - src/router/index.tsx
decisions:
  - "OrderStatusButtons returns null for terminal statuses (hoan_thanh, huy) — no buttons rendered vs. disabled buttons"
  - "Cancel uses useCancelOrder (POST /cancel) not updateStatus mutation — enforced by separate hook from Plan 01"
  - "FORWARD_TRANSITIONS map defined locally in OrderStatusButtons — keeps state machine co-located with UI"
  - "parseFloat(total_amount) applied at render time — total_amount is a decimal string in OrderResource"
metrics:
  duration_seconds: 660
  completed_date: "2026-03-29T06:15:17Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
requirements_addressed: [AORD-01, AORD-02, AORD-03]
---

# Phase 03 Plan 03: Order Management Page Summary

**One-liner:** Order management page with paginated filtered table, full-detail drawer, and FORWARD_TRANSITIONS state machine buttons using separate cancel endpoint.

## What Was Built

Admin can now manage the full order lifecycle through a single page at `/admin/orders`.

### OrdersPage (`src/pages/admin/OrdersPage.tsx`)

Paginated orders table with three filter controls:
- Status dropdown (Select with all 5 statuses and Vietnamese labels)
- Customer search (Input.Search by name or phone)
- Date range picker (DatePicker.RangePicker for date_from/date_to)

Table columns: order ID, customer name, phone, total (formatVND), status (colored AntD Tag), payment status, created date, detail action button. Pagination wired to meta from PaginatedResponse.

### OrderDetailDrawer (`src/components/admin/OrderDetailDrawer.tsx`)

Right-side Drawer (width=560) opened by clicking "Chi tiet" on any row. Shows:
- Customer info via AntD Descriptions (name, phone, address, payment method, payment status, delivery method, created date)
- Items table (product name, quantity, unit price, subtotal)
- Total row using `parseFloat(order.total_amount)` before `formatVND()`
- OrderStatusButtons at the bottom for status transitions

### OrderStatusButtons (`src/components/admin/OrderStatusButtons.tsx`)

Dynamic buttons based on `FORWARD_TRANSITIONS` map:
- `cho_xac_nhan` → Xac nhan don
- `xac_nhan` → Bat dau giao, Tra ve cho
- `dang_giao` → Hoan thanh, Tra ve xac nhan
- `hoan_thanh` / `huy` → returns null (no buttons)

Cancel button shown for `CAN_CANCEL` statuses (cho_xac_nhan, xac_nhan, dang_giao) with Modal.confirm before executing `cancelOrder.mutate(orderId)` via POST /cancel.

### Router Update (`src/router/index.tsx`)

`/admin/orders` route now renders `<OrdersPage />` instead of `<PlaceholderPage title="Don hang" />`.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data flows through useAdminOrders/useAdminOrder hooks to real API endpoints established in Plan 01.

## Self-Check

### Files exist
- src/pages/admin/OrdersPage.tsx: FOUND
- src/components/admin/OrderDetailDrawer.tsx: FOUND
- src/components/admin/OrderStatusButtons.tsx: FOUND

### Commits exist
- b438e70: feat(03-03): add OrdersPage, OrderDetailDrawer, OrderStatusButtons - FOUND
- d820370: feat(03-03): wire OrdersPage into /admin/orders route - FOUND

## Self-Check: PASSED
