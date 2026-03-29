---
phase: 02-customer-purchase-flow
plan: "04"
subsystem: customer-checkout
tags: [checkout, order-confirmation, routing, phase-2]
dependency_graph:
  requires:
    - 02-01 (CheckoutPayload type, checkoutApi, cartStore.clearCartToken)
    - 02-02 (ProductDetailPage route wired in same update)
    - 02-03 (CartPage route wired in same update, useCart hook)
  provides:
    - CheckoutPage with COD form, idempotency, 422 error mapping
    - OrderConfirmationPage with copyable order ID and item table
    - All Phase 2 routes registered in router
  affects:
    - src/router/index.tsx (Phase 2 routes added)
    - Customer purchase funnel (checkout -> confirmation complete)
tech_stack:
  added: []
  patterns:
    - AntD Form with onFinish + form.setFields for server-side validation mapping
    - crypto.randomUUID() for idempotency key generated once on mount via useState initializer
    - useLocation().state for passing order data to confirmation page without extra API call
    - queryClient.removeQueries to invalidate cart cache after checkout
key_files:
  created:
    - src/pages/customer/CheckoutPage.tsx
    - src/pages/customer/OrderConfirmationPage.tsx
  modified:
    - src/router/index.tsx
decisions:
  - Note field shown in form but intentionally excluded from CheckoutPayload (backend has no note field per RESEARCH.md gap)
  - Payment method displayed as disabled Radio.Group (COD only, read-only per CHECKOUT-03)
  - OrderConfirmationPage uses useLocation().state to receive order data — avoids extra GET /orders/:id API call
  - Guard on empty cart redirects to /cart; guard on missing order state redirects to /
metrics:
  duration_minutes: ~30
  completed_date: "2026-03-29"
  tasks_completed: 3
  files_changed: 3
---

# Phase 2 Plan 04: Checkout + Route Wiring Summary

**One-liner:** COD checkout with idempotency key, inline 422 validation mapping, and all Phase 2 customer routes wired into React Router.

---

## What Was Built

### Task 1: CheckoutPage and OrderConfirmationPage (commit: 44986cc)

**CheckoutPage** (`src/pages/customer/CheckoutPage.tsx`, 183 lines):

- AntD `Form` with `layout="vertical"` — three required fields: customer_name, customer_phone, delivery_address
- Phone validation: `/^0\d{9}$/` regex matching backend contract
- Idempotency key via `useState(() => crypto.randomUUID())` — generated once per page mount, prevents duplicate order submissions on network retry
- Note field displayed with helper text "(Tính năng đang cập nhật)" — NOT sent in `CheckoutPayload` (backend has no note field)
- Payment method: disabled `Radio.Group` with single COD option (read-only per CHECKOUT-03)
- `onFinish` handler: submits via `checkoutApi.submit`, on success calls `clearCartToken()` + `queryClient.removeQueries(['cart'])`, navigates to `/orders/confirm` with order in location state
- 422 error handling: maps Laravel `errors` object to AntD `form.setFields` for inline field-level errors
- Empty cart guard: `useEffect` redirects to `/cart` when cart is empty
- Two-column layout (form md=14, summary md=10) collapses to single column on mobile

**OrderConfirmationPage** (`src/pages/customer/OrderConfirmationPage.tsx`, 93 lines):

- AntD `Result` with `status="success"` and title "Đặt hàng thành công!"
- `Text copyable` for order ID (copyable attribute on `#{order.id}`)
- `Descriptions bordered` showing customer info, delivery address, status, payment method, total
- `total_amount` parsed with `parseInt()` before `formatVND()` (OrderResource.total_amount is a string)
- `Table<OrderItemResource>` for item list: product name, quantity (parseInt), subtotal_vnd (formatVND)
- CTA buttons: "Tiếp tục mua sắm" → `/`, "Xem đơn hàng của tôi" → `/account/orders` (Phase 4)
- Missing order state guard: `useEffect` redirects to `/`

### Task 2: Router Wiring (commit: 299a5a1)

Added four Phase 2 customer routes inside the `CustomerLayout` children array:

```
/products/:id  → ProductDetailPage
/cart          → CartPage
/checkout      → CheckoutPage
/orders/confirm → OrderConfirmationPage
```

All Phase 1 admin and customer routes preserved unchanged.

### Task 3: Human Verification (checkpoint — approved)

User approved the complete purchase flow verification: browse → detail → add to cart → cart management → checkout → confirmation.

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Known Stubs

- "Xem đơn hàng của tôi" button links to `/account/orders` which does not exist yet (Phase 4 scope). This is intentional — plan explicitly notes "will 404 for now, that's fine".
- Note field is shown in the UI but intentionally not sent to backend (documented in plan as RESEARCH.md gap). This is a deliberate stub, not a bug.

---

## Self-Check

### Files exist:
- src/pages/customer/CheckoutPage.tsx — FOUND
- src/pages/customer/OrderConfirmationPage.tsx — FOUND
- src/router/index.tsx (modified) — FOUND

### Commits exist:
- 44986cc feat(02-04): create CheckoutPage and OrderConfirmationPage — FOUND
- 299a5a1 feat(02-04): wire all Phase 2 routes into router — FOUND

## Self-Check: PASSED
