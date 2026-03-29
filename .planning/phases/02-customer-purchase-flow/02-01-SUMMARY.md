---
phase: 02-customer-purchase-flow
plan: 01
subsystem: api
tags: [typescript, axios, tanstack-query, zustand, vitest, cart, checkout, products]

# Dependency graph
requires:
  - phase: 01-foundation-authentication
    provides: axiosInstance with Bearer token interceptor, authStore, TypeScript types foundation

provides:
  - ProductResource, CartData, CheckoutPayload, OrderResource TypeScript interfaces
  - productApi (list, getById) against GET /products and GET /products/:id
  - cartApi (create, get, addItem, updateItem, removeItem) against /cart and /cart/items
  - checkoutApi.submit() with Idempotency-Key header against POST /checkout
  - useCartStore token-only store persisted as cart_token_storage
  - X-Cart-Token header injection in axiosInstance for cart/checkout routes
  - useProducts, useProduct, useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem, useCategories TanStack Query hooks

affects: [02-02, 02-03, 02-04, 03-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "API module pattern: export const xApi = { method: async (...) => response.data.data }"
    - "TanStack Query hooks wrap API modules with queryKey, queryFn, staleTime"
    - "Cart token auto-creation: ensureCartToken() before cart mutations"
    - "Cart error recovery: handleCartError() recreates cart on CART_NOT_FOUND/CART_TOKEN_REQUIRED"
    - "axiosInstance interceptor reads Zustand store via getState() for side-effect-free header injection"

key-files:
  created:
    - src/api/productApi.ts
    - src/api/cartApi.ts
    - src/api/checkoutApi.ts
    - src/hooks/useProducts.ts
    - src/hooks/useProduct.ts
    - src/hooks/useCart.ts
    - src/hooks/useCategories.ts
    - src/api/__tests__/productApi.test.ts
    - src/api/__tests__/cartApi.test.ts
    - src/api/__tests__/checkoutApi.test.ts
    - src/stores/__tests__/cartStore.test.ts
  modified:
    - src/types/api.ts
    - src/stores/cartStore.ts
    - src/api/axiosInstance.ts

key-decisions:
  - "cartStore persists only cartToken (not items) — cart data lives in backend, token is the identity key"
  - "X-Cart-Token injected via axiosInstance interceptor using useCartStore.getState() to avoid React hook context requirements"
  - "CART_TOKEN_REQUIRED and CART_NOT_FOUND 401s skip admin login redirect — cart errors are separate from auth errors"
  - "useCategories gracefully degrades to empty array on 401 — guest users browsing products work without auth"
  - "checkoutApi sends payment_method: 'cod' only — no note field per backend contract"

patterns-established:
  - "API modules always return response.data for lists (keeping envelope) and response.data.data for single resources"
  - "TanStack Query hooks established as the sole data-fetching layer for UI components"
  - "Cart mutation hooks invalidate ['cart'] queryKey on success to trigger UI refresh"

requirements-completed: [PROD-01, PROD-04, CART-01, CART-02, CART-03, CART-05, CHECKOUT-01, CHECKOUT-02, CHECKOUT-03]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 02 Plan 01: Data Layer — Types, API Modules, Cart Store, and Query Hooks

**3 API modules (product/cart/checkout) + refactored token-only cartStore + 4 TanStack Query hooks + X-Cart-Token injection, giving downstream UI plans a complete data layer**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-29T04:16:15Z
- **Completed:** 2026-03-29T04:19:42Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Extended `src/types/api.ts` with 12 new Phase 2 interfaces covering products, cart, checkout, and orders
- Created 3 API modules (productApi, cartApi, checkoutApi) with correct HTTP methods, URL paths, and response extraction
- Replaced local-items cartStore with token-only store persisted to localStorage as `cart_token_storage`
- Added X-Cart-Token header injection in axiosInstance with smart exclusion of admin-redirect for cart 401 errors
- Created 4 TanStack Query hooks (useProducts, useProduct, useCart/mutation hooks, useCategories) ready for UI consumption
- 23 unit tests all passing (17 API module tests + 6 cartStore tests)

## Task Commits

1. **Task 1: Define TypeScript types and create API modules** - `d965408` (feat)
2. **Task 2: Refactor cartStore, add X-Cart-Token interceptor, create TanStack Query hooks** - `074f109` (feat)

## Files Created/Modified

- `src/types/api.ts` - Extended with ProductResource, ProductDetailResource, CategoryResource, PaginatedResponse, CartItemResource, CartData, CheckoutPayload, OrderItemResource, OrderResource, ProductListParams
- `src/api/productApi.ts` - list(params) and getById(id) hitting /products endpoints
- `src/api/cartApi.ts` - create/get/addItem/updateItem/removeItem for /cart and /cart/items
- `src/api/checkoutApi.ts` - submit(payload, idempotencyKey) with Idempotency-Key header
- `src/stores/cartStore.ts` - Replaced items-array store with token-only store (cartToken, setCartToken, clearCartToken)
- `src/api/axiosInstance.ts` - Added X-Cart-Token injection + cart 401 error code exception
- `src/hooks/useProducts.ts` - useQuery wrapper with keepPreviousData and ['products', params] queryKey
- `src/hooks/useProduct.ts` - useQuery wrapper with enabled: id > 0 guard
- `src/hooks/useCart.ts` - useCart + useAddToCart + useUpdateCartItem + useRemoveCartItem with auto token creation and error recovery
- `src/hooks/useCategories.ts` - useQuery with graceful 401 degradation returning empty array for guests
- `src/api/__tests__/productApi.test.ts` - 4 tests covering list() and getById()
- `src/api/__tests__/cartApi.test.ts` - 8 tests covering all cart operations
- `src/api/__tests__/checkoutApi.test.ts` - 5 tests covering submit() with Idempotency-Key and no note field
- `src/stores/__tests__/cartStore.test.ts` - 6 tests covering setCartToken, clearCartToken, persist key name

## Decisions Made

- **cartStore persists only token, not items:** Cart data lives in the backend; the token is the session identity. This eliminates client-side cart sync problems.
- **X-Cart-Token via interceptor using getState():** avoids React hook restrictions — axiosInstance is not a React component.
- **CART_TOKEN_REQUIRED/CART_NOT_FOUND skip admin redirect:** These 401s are normal cart lifecycle events, not auth failures. Distinguishing by `error.response.data.code` prevents logout on cart expiry.
- **useCategories degrades gracefully:** Backend only has `/admin/categories` requiring auth. Guest product browsing works with empty category list rather than blocking.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added CART_NOT_FOUND to the 401 skip-redirect check**
- **Found during:** Task 2 (axiosInstance update)
- **Issue:** Plan only specified `CART_TOKEN_REQUIRED` exception, but `CART_NOT_FOUND` also returns 401 and should not trigger admin redirect
- **Fix:** Added both `CART_TOKEN_REQUIRED` and `CART_NOT_FOUND` error codes to the conditional check
- **Files modified:** src/api/axiosInstance.ts
- **Committed in:** 074f109 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing critical — security/correctness)
**Impact on plan:** Minimal scope change. Adding the second error code is essential for correctness; without it, cart expiry would log out admin users.

## Issues Encountered

Pre-existing test failures in `src/api/__tests__/authApi.test.ts` (6 failures) and `src/stores/__tests__/authStore.test.ts` (1 failure) were found. These are Phase 01 issues unrelated to this plan — `authApi.test.ts` expects `/auth/login` but implementation uses `/admin/login`. Logged to `deferred-items.md`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Complete data layer established; all 3 API modules export their objects with correct endpoints
- CartStore token-only, TanStack Query hooks ready for 02-02 (ProductListPage), 02-03 (ProductDetailPage + Cart), 02-04 (CheckoutPage)
- axiosInstance properly handles cart/checkout authentication with X-Cart-Token header
- TypeScript compiles cleanly (`npx tsc --noEmit` passes)

---
*Phase: 02-customer-purchase-flow*
*Completed: 2026-03-29*
