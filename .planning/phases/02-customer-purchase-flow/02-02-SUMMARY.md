---
phase: 02-customer-purchase-flow
plan: 02
subsystem: ui
tags: [react, antd, tanstack-query, zustand, typescript, vnd, product-catalog]

# Dependency graph
requires:
  - phase: 02-01
    provides: hooks (useProducts, useProduct, useCategories, useAddToCart), types (ProductResource, ProductDetailResource, CategoryResource, PaginatedResponse)

provides:
  - formatVND utility (Intl.NumberFormat vi-VN VND formatter)
  - ProductCard component with stock badge, add-to-cart, out-of-stock handling
  - CategoryFilter component fetching categories via useCategories
  - ProductGrid component with responsive AntD layout, skeleton loading, empty state, pagination
  - HomePage product listing with category filter, sort, client-side search, error/loading states
  - ProductDetailPage with image gallery (Image.PreviewGroup), stock color coding, quantity picker, add-to-cart

affects: [02-03, 02-04, 03-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client-side search filters current page results only — documented in code comment"
    - "Image gallery uses local selectedImageIndex state for thumbnail switching"
    - "Stock color coding: #52c41a (>5), #faad14 (1-5), Tag color=error (0)"
    - "Add-to-cart quantity resets to 1 on success via mutation onSuccess callback"
    - "Category list flattened recursively (parent + children) for Select options"

key-files:
  created:
    - src/utils/format.ts
    - src/components/customer/ProductCard.tsx
    - src/components/customer/CategoryFilter.tsx
    - src/components/customer/ProductGrid.tsx
    - src/pages/customer/ProductDetailPage.tsx
  modified:
    - src/pages/customer/HomePage.tsx

key-decisions:
  - "Client-side search only searches the current page — page-crossing search would require server-side API support"
  - "CategoryFilter flattens parent+children into a flat Select list for simplicity"
  - "Pagination only renders when total > per_page to avoid empty pagination bar"

patterns-established:
  - "ProductCard: cover prop for image, Card.Meta for name/price, Card actions for CTA"
  - "Responsive product grid: xs=24 sm=12 md=8 lg=6 with Row gutter=[32,32]"
  - "Loading state: 8 skeleton cards in same grid layout as real cards"

requirements-completed: [PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 02 Plan 02: Product Catalog UI Summary

**Paginated product grid with category filter, client-side search, and full product detail page with image gallery, VND price formatting, and stock color coding using Ant Design 5**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-29T11:20:00Z
- **Completed:** 2026-03-29T11:35:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Built complete product catalog browsing UI: HomePage with paginated grid, category filter, sort, and client-side search
- Created ProductDetailPage with Image.PreviewGroup gallery, stock color coding (green/orange/red), quantity picker, and add-to-cart
- Established VND price formatting utility (Intl.NumberFormat vi-VN) used consistently across both pages and ProductCard

## Task Commits

Each task was committed atomically:

1. **Task 1: Create formatVND utility, ProductCard, CategoryFilter, ProductGrid** - `373338b` (feat)
2. **Task 2: Build HomePage and ProductDetailPage** - `32bd4ad` (feat)

## Files Created/Modified

- `src/utils/format.ts` - VND currency formatter using Intl.NumberFormat('vi-VN')
- `src/components/customer/ProductCard.tsx` - Product card with thumbnail, price, stock tag, add-to-cart button
- `src/components/customer/CategoryFilter.tsx` - Category Select with flat list from useCategories hook
- `src/components/customer/ProductGrid.tsx` - Responsive AntD grid with skeleton loading, empty state, pagination
- `src/pages/customer/HomePage.tsx` - Full product listing page replacing stub (category filter, sort, client-side search)
- `src/pages/customer/ProductDetailPage.tsx` - Product detail with image gallery, stock display, quantity picker

## Decisions Made

- Client-side search filters only the current page (not cross-page) — server-side search would require API support not in scope
- CategoryFilter recursively flattens parent+children into a flat Select list for simplicity
- Pagination bar only renders when total > per_page to avoid an empty/redundant bar on small catalogs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript check passed cleanly on both tasks.

## Known Stubs

None - all data is wired to real hooks (useProducts, useProduct, useCategories, useAddToCart) from Plan 01.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Product catalog is fully browsable; visitors can filter, search, sort, and view details
- Add-to-cart is wired and ready — Cart page (Plan 03) can consume the same useCart/useAddToCart hooks
- formatVND utility available for Cart and Checkout pages

## Self-Check: PASSED

- FOUND: src/utils/format.ts
- FOUND: src/components/customer/ProductCard.tsx
- FOUND: src/components/customer/CategoryFilter.tsx
- FOUND: src/components/customer/ProductGrid.tsx
- FOUND: src/pages/customer/HomePage.tsx
- FOUND: src/pages/customer/ProductDetailPage.tsx
- FOUND commit: 373338b (feat: formatVND + components)
- FOUND commit: 32bd4ad (feat: HomePage + ProductDetailPage)

---
*Phase: 02-customer-purchase-flow*
*Completed: 2026-03-29*
