# Phase 2: Customer Purchase Flow — Research

**Researched:** 2026-03-29
**Domain:** React SPA — product catalog browsing, localStorage-backed cart with backend cart token, COD checkout
**Confidence:** HIGH (all findings sourced directly from the live codebase, zero training-data assumptions)

---

## Summary

Phase 2 builds the complete customer-facing purchase loop on top of the Phase 1 foundation. The backend is fully implemented and all API contracts have been read directly from source code — no guesswork required. Three surfaces must be built: the product catalog (list + detail), the cart (Zustand-persisted locally, mirrored to a backend cart via `X-Cart-Token`), and the checkout flow (COD form + order confirmation page).

The most important architectural decision for this phase is the **cart strategy**. The backend provides a server-side cart (UUID token, 7-day expiry, `X-Cart-Token` header). The existing `cartStore.ts` from Phase 1 is a local-only Zustand store that does NOT communicate with the backend cart API. These two must be reconciled: the correct approach is to use the backend cart as the single source of truth for item/subtotal data (because it computes prices server-side from live product prices), while using `localStorage` to persist the `X-Cart-Token` so the cart survives a browser refresh.

There is one confirmed **API contract gap**: CHECKOUT-01 requires a "note" field in the checkout form, but the backend `CheckoutRequest` and `PlaceOrderAction` have no `note` parameter. The frontend can collect the field but must omit it from the API payload, OR the backend must be extended before checkout submission.

There is one confirmed **product search limitation**: `GET /api/v1/products` only supports `filter[category_id]` — there is no backend `filter[name]` or `filter[search]`. PROD-03 (search by name) must be implemented as client-side filtering within the current page of results, OR the backend `PublicProductController` must be updated to add a partial-match filter. This is a plan decision, not a blocker.

**Primary recommendation:** Use the backend cart API as source of truth for cart contents. Persist only the `X-Cart-Token` UUID in localStorage via the Zustand store. Fetch fresh cart data from the backend on mount.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-01 | Paginated product list | `GET /api/v1/products` with `page`, `per_page`, `sort` params; TanStack Query `useQuery` with `keepPreviousData` |
| PROD-02 | Filter by category | `filter[category_id]` query param; categories fetched from `GET /api/v1/admin/categories` (or loaded alongside products) |
| PROD-03 | Search by name | BACKEND GAP: no `filter[name]` exists; must use client-side filter on current page results OR add backend filter |
| PROD-04 | Product detail page (name, desc, price, image) | `GET /api/v1/products/{id}` — `ProductDetailResource` includes all fields |
| PROD-05 | Stock count display ("Còn N con") | `stock_quantity` field in `ProductDetailResource`; `unit_type` field for "con"/"cặp" |
| PROD-06 | Out-of-stock clear status + disabled Add-to-Cart | `stock_quantity == 0` disables button; `is_active` from API |
| CART-01 | Add to cart from list or detail | `POST /api/v1/cart/items` with `X-Cart-Token` header; `{ product_id, quantity }` body |
| CART-02 | Update quantity | `PATCH /api/v1/cart/items/{item_id}` with `{ quantity }` |
| CART-03 | Remove item | `DELETE /api/v1/cart/items/{item_id}` |
| CART-04 | Real-time total | Backend `CartResource` returns `total_amount` as computed integer (VND) |
| CART-05 | Cart survives refresh | Persist `X-Cart-Token` UUID in localStorage via Zustand `persist`; fetch cart from backend on mount |
| CHECKOUT-01 | Form: name, phone, address, note | Backend accepts `customer_name`, `customer_phone`, `delivery_address` — NOTE FIELD NOT IN BACKEND; note is frontend-only display |
| CHECKOUT-02 | Order confirmation page with order ID and summary | POST checkout returns `OrderResource` with `id`, `items[]`, `total_amount`, `order_status_label` |
| CHECKOUT-03 | COD as default payment method | `payment_method: 'cod'` hardcoded in checkout request (COD is default per requirements; `chuyen_khoan` exists but is not v1 scope) |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: Vite 6, React 18.3 (NOT 19), TypeScript strict mode
- **UI Library**: Ant Design 5 — use built-in Table, Form, Card, Badge, Button components
- **State Management**: Zustand 5 with `persist` middleware
- **Data Fetching**: TanStack Query v5 for all server state
- **HTTP**: axios via existing `axiosInstance` — do NOT create a second axios instance
- **Forms**: Ant Design `Form` with `rules` prop — do NOT introduce React Hook Form
- **Routing**: React Router v6 `createBrowserRouter` — extend the existing `router/index.tsx`
- **No SSR**: Vite SPA only
- **API Base URL**: `http://127.0.0.1:8000/api/v1` (from `.env.development`)

---

## Backend API Contract (Source of Truth)

All routes verified from `routes/api.php` and controller source code. Base URL prefix: `/api/v1`.

### Product Endpoints (public, no auth)

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| GET | `/products` | `filter[category_id]`, `sort`, `per_page`, `page` | Paginated list (active only) |
| GET | `/products/{id}` | — | Product detail with all images + category |

**Allowed sorts for GET /products:** `name`, `price_vnd`, `created_at` (prefix `-` for descending, e.g. `-created_at`). Default sort: `name`.

**CRITICAL: No `filter[name]` exists.** `spatie/laravel-query-builder` only has `allowedFilters('category_id')` in `PublicProductController::index()`. Adding name search requires a backend change.

### Category Endpoint (admin, requires Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/categories` | All categories with children (2-level max) |

**Note:** Categories are served from the admin route — they require the admin auth token. If a public category endpoint is needed for the customer-facing filter, the backend must expose one, OR categories can be loaded using the admin token when available. Alternative: hardcode category list from seed data, or add a public `/categories` route in the backend. This is a plan decision.

### Cart Endpoints (public, no auth required for create; `X-Cart-Token` header required for all others)

| Method | Path | Headers | Body | Response |
|--------|------|---------|------|----------|
| POST | `/cart` | — | — | `{ success, data: { token, expires_at } }` |
| GET | `/cart` | `X-Cart-Token` | — | `{ success, data: CartResource }` |
| POST | `/cart/items` | `X-Cart-Token` | `{ product_id, quantity }` | `{ success, data: CartResource }` (201) |
| PATCH | `/cart/items/{item}` | `X-Cart-Token` | `{ quantity }` | `{ success, data: CartResource }` |
| DELETE | `/cart/items/{item}` | `X-Cart-Token` | — | `{ success, message }` |

**Cart token behavior:**
- Cart token is a UUID, 7-day expiry
- Missing `X-Cart-Token` on cart routes returns `401` with `code: CART_TOKEN_REQUIRED`
- Invalid/expired token returns `404` with `code: CART_NOT_FOUND`
- When cart is not found (expired), frontend must create a new cart (`POST /cart`) and start fresh

### Checkout Endpoint (public, `X-Cart-Token` required, `Idempotency-Key` required when middleware is enabled)

| Method | Path | Headers | Body |
|--------|------|---------|------|
| POST | `/checkout` | `X-Cart-Token`, `Idempotency-Key` (UUID) | `{ customer_name, customer_phone, delivery_address, payment_method }` |

**Idempotency:** `IDEMPOTENCY_ENABLED` defaults to `false` in config. The middleware is applied to the route but is a no-op when disabled. Frontend should send `Idempotency-Key: <uuid>` header regardless — safe to include even when disabled.

**Payment method values:** `cod` or `chuyen_khoan` (string enum). Phase 2 uses `cod` only (CHECKOUT-03).

**Note field:** `CheckoutRequest` does NOT have a `note` field. `PlaceOrderAction` does NOT accept a note parameter. The Order domain entity has no note field. CHECKOUT-01 requires a note field in the UI. **Resolution needed:** Either (a) add note to backend (proper fix) or (b) show note field in UI but drop it from the API payload (data loss, not ideal).

---

## Exact Response Shapes

### ProductResource (list item)
```typescript
{
  id: number;
  name: string;
  description: string;
  price_vnd: number;
  unit_type: string;           // 'con' | 'cặp' (UnitType enum value)
  category_id: number;
  stock_quantity: number;      // raw number, not string in ProductResource
  is_active: boolean;
  primary_image: {
    url: string;               // S3 full URL
    thumbnail_url: string;     // S3 thumbnail URL
  } | null;
  created_at: string;          // ISO 8601
  updated_at: string;
}
```

**Pagination envelope** (Laravel ResourceCollection):
```typescript
{
  data: ProductResource[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}
```

### ProductDetailResource (single product)
```typescript
// Wrapped in { success: true, data: ... }
{
  id: number;
  name: string;
  description: string;
  price_vnd: number;
  unit_type: string;
  category_id: number;
  category: CategoryResource;
  stock_quantity: number;
  is_active: boolean;
  images: ProductImageResource[];
  created_at: string;
  updated_at: string;
}
```

### ProductImageResource
```typescript
{
  id: number;
  url: string;               // S3 full URL
  thumbnail_url: string;
  is_primary: boolean;
  sort_order: number;
}
```

### CartResource
```typescript
// Wrapped in { success: true, data: ... }
{
  id: number;
  token: string;             // UUID
  expires_at: string;        // ISO 8601
  items: CartItemResource[];
  total_amount: number;      // VND integer, computed server-side
}
```

### CartItemResource
```typescript
{
  id: number;                // Cart item ID (NOT product ID — used for PATCH/DELETE)
  product_id: number;
  product_name: string;
  product_price_vnd: number;
  quantity: string;          // IMPORTANT: quantity is returned as a decimal string e.g. "2.000"
  subtotal: number;          // VND integer
  is_available: boolean;     // product.is_active
}
```

### OrderResource (checkout response)
```typescript
// Wrapped in { success: true, data: ... }
{
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: 'cho_xac_nhan' | 'xac_nhan' | 'dang_giao' | 'hoan_thanh' | 'huy';
  order_status_label: string;       // Vietnamese: 'Chờ xác nhận' etc.
  payment_method: 'cod' | 'chuyen_khoan';
  payment_method_label: string;
  payment_status: string;           // 'chua_thanh_toan' etc.
  payment_status_label: string;
  delivery_method: string | null;
  delivery_method_label: string | null;
  total_amount: string;             // IMPORTANT: total_amount is a string in OrderResource
  created_by: number | null;
  items: OrderItemResource[];
  created_at: string;
  updated_at: string;
}
```

### OrderItemResource
```typescript
{
  id: number;
  product_id: number;
  product_name: string;
  price_vnd: number;
  quantity: string;               // decimal string
  subtotal_vnd: number;
}
```

### CategoryResource
```typescript
{
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  children: CategoryResource[];
  created_at: string;
  updated_at: string;
}
```

### Error shapes
```typescript
// Cart token errors (401/404)
{ success: false; code: 'CART_TOKEN_REQUIRED' | 'CART_NOT_FOUND'; message: string; errors: {} }

// Validation errors (422) — standard Laravel
{ message: string; errors: Record<string, string[]> }

// Not found (404)
{ message: string }  // e.g. "Sản phẩm không tồn tại."
```

---

## Standard Stack

### Core (from package.json — versions confirmed)
| Library | Version | Purpose |
|---------|---------|---------|
| react / react-dom | ^18.3.0 | UI rendering |
| react-router-dom | ^6.26.0 | Routing — extend existing `router/index.tsx` |
| zustand | ^5.0.0 | Cart token persistence + local cart state |
| @tanstack/react-query | ^5.51.0 | Product/cart data fetching, loading/error states |
| axios | ^1.7.0 | HTTP via existing `axiosInstance` |
| antd | ^5.20.0 | Card, List, Descriptions, Form, InputNumber, Badge, Tag, Divider, Breadcrumb, Image |
| @ant-design/icons | ^5.4.0 | ShoppingCartOutlined, InboxOutlined, etc. |
| zod | ^3.23.0 | TypeScript types from API response schemas |

**No new dependencies needed for Phase 2.** All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure for Phase 2

```
src/
├── api/
│   ├── axiosInstance.ts      # Phase 1 — DO NOT MODIFY (add cart token injection here)
│   ├── authApi.ts            # Phase 1 — leave alone
│   ├── productApi.ts         # NEW — GET /products, GET /products/:id
│   ├── cartApi.ts            # NEW — POST /cart, GET /cart, POST/PATCH/DELETE /cart/items
│   └── checkoutApi.ts        # NEW — POST /checkout
├── stores/
│   ├── authStore.ts          # Phase 1 — leave alone
│   └── cartStore.ts          # MODIFY — replace local-only store with token-aware store
├── hooks/
│   ├── useProducts.ts        # NEW — TanStack Query hook for product list
│   ├── useProduct.ts         # NEW — TanStack Query hook for product detail
│   ├── useCart.ts            # NEW — TanStack Query hook for cart from backend
│   └── useCategories.ts      # NEW — TanStack Query hook for categories
├── types/
│   └── api.ts                # EXTEND — add Product, Cart, Order, Category types
├── pages/customer/
│   ├── HomePage.tsx          # REPLACE — was stub, becomes products list
│   ├── ProductDetailPage.tsx # NEW
│   ├── CartPage.tsx          # NEW
│   ├── CheckoutPage.tsx      # NEW
│   └── OrderConfirmationPage.tsx  # NEW
├── components/
│   └── customer/
│       ├── ProductCard.tsx        # NEW — card for list view
│       ├── ProductGrid.tsx        # NEW — grid + pagination
│       ├── CartItemRow.tsx        # NEW — cart line item
│       └── CategoryFilter.tsx     # NEW — category select/tabs
└── router/
    └── index.tsx             # EXTEND — add /products/:id, /cart, /checkout, /orders/confirm
```

### Pattern 1: TanStack Query for Paginated Products

Use `useQuery` with `keepPreviousData` (v5: `placeholderData: keepPreviousData`) to avoid content flash between pages.

```typescript
// src/hooks/useProducts.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}
```

### Pattern 2: Cart Token Strategy

The cart token is the glue between the frontend cart UX and the backend cart state. The Zustand cart store must be refactored to hold the token, and all cart operations must go through the backend API.

```typescript
// src/stores/cartStore.ts — REPLACE existing implementation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartToken: string | null;     // UUID from POST /cart
  setCartToken: (token: string) => void;
  clearCartToken: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartToken: null,
      setCartToken: (token) => set({ cartToken: token }),
      clearCartToken: () => set({ cartToken: null }),
    }),
    { name: 'cart_token_storage' },  // localStorage key
  ),
);
```

The existing `CartItem` type, `addItem`, `removeItem`, `updateQuantity`, `totalAmount`, etc. are replaced by TanStack Query fetching the `CartResource` from the backend. The backend computes `total_amount` — do not recompute on frontend.

### Pattern 3: Cart Token Header Injection

The `axiosInstance` request interceptor in `axiosInstance.ts` currently only injects the Bearer auth token. A second interceptor (or extending the existing one) must inject `X-Cart-Token` on cart and checkout routes.

**Approach:** Add a second request interceptor in `axiosInstance.ts` that reads `cartToken` from the store and injects `X-Cart-Token` when the URL contains `/cart` or `/checkout`.

```typescript
// Add to axiosInstance.ts request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Inject cart token for cart and checkout routes
  const cartToken = useCartStore.getState().cartToken;
  if (cartToken && (config.url?.includes('/cart') || config.url?.includes('/checkout'))) {
    config.headers['X-Cart-Token'] = cartToken;
  }
  return config;
});
```

### Pattern 4: Auto-Create Cart on First Add

When the user first adds an item (no `cartToken` in store), the flow is:
1. `POST /cart` → receive UUID token
2. Store token via `setCartToken(token)`
3. `POST /cart/items` with the new token
4. Invalidate `['cart']` query to refresh cart display

When `cartToken` exists but backend returns 404 (expired), create a new cart and retry.

### Pattern 5: Checkout Idempotency Key

Generate a UUID v4 on the checkout page mount. Attach as `Idempotency-Key` header. The backend currently has `IDEMPOTENCY_ENABLED=false` so it is a no-op — but sending the header is harmless and future-proof.

```typescript
// Generate once on component mount, not on every render
const [idempotencyKey] = useState(() => crypto.randomUUID());
```

### Anti-Patterns to Avoid

- **Duplicating total calculation on frontend:** The backend `CartResource.total_amount` is authoritative. Do not recompute `price * quantity` in the frontend — you will get float drift on decimal quantities.
- **Storing full cart items in localStorage:** Store only the `cartToken`. Cart data is always fetched fresh from the backend.
- **Using `POST /admin/categories` for public category list:** The admin category endpoint requires Bearer token. Handle this carefully — see Open Questions.
- **Forgetting `item.id` vs `product_id`:** `CartItemResource.id` is the cart item ID used for PATCH/DELETE. `product_id` is the product. Confusing these causes wrong items being updated.
- **Treating `stock_quantity` as a string:** `ProductResource.stock_quantity` is a number. `CartItemResource.quantity` is a decimal string (e.g. `"2.000"`). Handle the type difference when displaying.
- **`OrderResource.total_amount` is a string:** The field is a string in the checkout response — parse with `parseInt()` or `Number()` before display.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Paginated product list with loading state | `useEffect` + `useState` + manual pagination | `useQuery` with `placeholderData: keepPreviousData` | Race conditions, stale data, no dedup |
| Cart item CRUD with optimistic updates | Manual state merging | `useMutation` + `queryClient.invalidateQueries(['cart'])` | Backend is authoritative source |
| Phone number validation | Custom regex in component | AntD Form `rules` with `pattern: /^0\d{9}$/` | Same regex the backend validates against |
| Price formatting (VND) | `price.toLocaleString()` inline | `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` or utility function | Consistent thousands separator |
| UUID generation for idempotency | External library | `crypto.randomUUID()` | Browser native, no dependency needed |
| Category data fetching | Separate fetch on every component | Single `useQuery(['categories'])` shared via TanStack Query cache | One network request reused everywhere |

---

## Common Pitfalls

### Pitfall 1: Cart Token Expiry Handling
**What goes wrong:** Token stored in localStorage but expired on backend → all cart operations return 404. User appears to have an empty cart but cannot add items.
**Why it happens:** 7-day expiry; backend silently rejects old tokens.
**How to avoid:** In cart API error handler (404 with `code: CART_NOT_FOUND`), call `POST /cart` to get a new token, update the store, then retry the operation.
**Warning signs:** Add-to-cart always fails after days of no use.

### Pitfall 2: Checkout Leaves Cart Alive
**What goes wrong:** After a successful checkout, the cart token still exists in localStorage and `GET /cart` still returns items (backend may not auto-clear on order).
**How to avoid:** After successful checkout, call `clearCartToken()` and invalidate the cart query. Navigate to order confirmation with the order data from the `POST /checkout` response.
**Warning signs:** User sees old cart items after completing an order.

### Pitfall 3: Search Requirement vs. Backend Capability
**What goes wrong:** Trying to call `GET /products?filter[name]=...` returns all products (filter is silently ignored by spatie/query-builder when not in `allowedFilters`).
**How to avoid:** Implement search as client-side filter (`products.filter(p => p.name.toLowerCase().includes(query))`) on the current page. Document that this only searches within the loaded page, not across all pages.
**Warning signs:** Search returns results that don't match the query.

### Pitfall 4: Category Filter Requires Auth Token
**What goes wrong:** `GET /api/v1/admin/categories` is behind `auth:sanctum` middleware. Calling it as a guest returns 401.
**How to avoid:** See Open Questions — plan must either (a) add a public `/categories` endpoint to backend, or (b) load categories using admin token only when logged in, or (c) hardcode known categories from seed data. Option (a) is cleanest.
**Warning signs:** Category dropdown is empty or errors for guest users.

### Pitfall 5: AntD InputNumber and Decimal Quantities
**What goes wrong:** Product quantities in CartItemResource are decimal strings ("2.000"). AntD InputNumber defaults to integer step.
**How to avoid:** Quantities for products like pigeons are whole numbers (1, 2, 3). Use `min={1}` `step={1}` `precision={0}` on `InputNumber`. Parse `quantity` string to `parseInt()` for display.

### Pitfall 6: Zustand cartStore Breaking Change
**What goes wrong:** Existing `cartStore.ts` has `CartItem[]` shape with `productId`, `name`, `price`, `quantity`. Phase 2 plan replaces it with token-only store. Any component that reads `items` from the old store will break.
**How to avoid:** The only consumer of the old `cartStore` is `CustomerLayout.tsx` (reads `s.items.length` for the cart badge count). After refactoring, `cartCount` must come from the TanStack Query cart data (not the Zustand store). Update `CustomerLayout` in the same plan that refactors the store.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Phase 1 `cartStore` (items in localStorage) | Token-based store (token in localStorage, items from backend) | Backend is authoritative for prices and totals |
| Stub `HomePage.tsx` (placeholder text) | Full product catalog with pagination and filtering | Phase 2 replaces entirely |
| Empty customer page routes | `/products/:id`, `/cart`, `/checkout`, `/orders/confirm/:id` routes added | Extend `router/index.tsx` |

---

## Open Questions

1. **Public category endpoint gap**
   - What we know: `GET /admin/categories` requires Bearer token. No public `/categories` route exists.
   - What's unclear: Can guests filter by category? Must be resolved before PROD-02 is planned.
   - Recommendation: Add `GET /api/v1/categories` as a public route in the backend. This is a 5-line backend change. If backend team unavailable, plan option B: pass known categories as static data from seed.

2. **Backend note field for CHECKOUT-01**
   - What we know: CheckoutRequest has no `note` field. PlaceOrderAction has no note parameter. OrderResource has no note field.
   - What's unclear: Is note required in the backend, or is it a frontend-only display feature?
   - Recommendation: Add `note` as an optional field to `CheckoutRequest`, `PlaceOrderAction`, the Order domain entity, and `OrderResource`. This is a backend team conversation. If deferred, the frontend form shows the note field but it is NOT sent in the API payload — document this explicitly in the plan.

3. **Product name search (PROD-03) scope**
   - What we know: Backend has no `filter[name]` support on public product endpoint. Adding it requires backend change.
   - Options: (a) Client-side filter on current page — simple, limits search to loaded page. (b) Add backend `AllowedFilter::partial('name')` — full search, requires backend team. (c) Defer to v2.
   - Recommendation: Implement client-side filter for now (option a). Document the limitation. Backend search can be layered in later with no frontend API change needed (the query key would change to include the search term).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build toolchain | Check at runtime | — | — |
| Backend Laravel (port 8000) | All API calls | Depends on dev env | — | Mock Service Worker for unit tests |
| S3 / image URLs | Product images | URLs in API response | — | Fallback to `<Image>` placeholder on error |

**All npm packages already installed** — `package.json` confirms all required dependencies are present. No `npm install` step needed for this phase.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1 + @testing-library/react 16 |
| Config file | `vite.config.ts` (vitest config inline) |
| Quick run command | `npx vitest run src/api/__tests__/ src/stores/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROD-01 | `productApi.list()` returns paginated products | unit | `npx vitest run src/api/__tests__/productApi.test.ts` | No — Wave 0 |
| PROD-04 | `productApi.getById()` returns product detail | unit | `npx vitest run src/api/__tests__/productApi.test.ts` | No — Wave 0 |
| CART-01 | `cartApi.addItem()` calls POST /cart/items | unit | `npx vitest run src/api/__tests__/cartApi.test.ts` | No — Wave 0 |
| CART-02 | `cartApi.updateItem()` calls PATCH /cart/items/:id | unit | `npx vitest run src/api/__tests__/cartApi.test.ts` | No — Wave 0 |
| CART-03 | `cartApi.removeItem()` calls DELETE /cart/items/:id | unit | `npx vitest run src/api/__tests__/cartApi.test.ts` | No — Wave 0 |
| CART-05 | `cartStore` persists token to localStorage | unit | `npx vitest run src/stores/` | No — Wave 0 |
| CHECKOUT-01/02/03 | `checkoutApi.submit()` sends correct payload | unit | `npx vitest run src/api/__tests__/checkoutApi.test.ts` | No — Wave 0 |
| PROD-02/03 | Category filter and name search UI | manual-only | UAT | — |
| PROD-05/06 | Stock display and disabled button | manual-only | UAT | — |
| CART-04 | Total updates in real-time | manual-only | UAT | — |

### Sampling Rate
- **Per task commit:** `npx vitest run src/api/__tests__/ src/stores/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before UAT

### Wave 0 Gaps
- [ ] `src/api/__tests__/productApi.test.ts` — covers PROD-01, PROD-04
- [ ] `src/api/__tests__/cartApi.test.ts` — covers CART-01, CART-02, CART-03
- [ ] `src/api/__tests__/checkoutApi.test.ts` — covers CHECKOUT-01, CHECKOUT-02, CHECKOUT-03
- [ ] `src/stores/cartStore.test.ts` — covers CART-05 (token persistence)

---

## Code Examples

Verified patterns from backend source code:

### Product List API Call
```typescript
// src/api/productApi.ts
import { axiosInstance } from './axiosInstance';

export interface ProductListParams {
  page?: number;
  per_page?: number;
  'filter[category_id]'?: number;
  sort?: string;
}

export const productApi = {
  list: async (params: ProductListParams) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data; // { data: Product[], links: {}, meta: {} }
  },
  getById: async (id: number) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data.data; // ProductDetail
  },
};
```

### Cart API Module
```typescript
// src/api/cartApi.ts
import { axiosInstance } from './axiosInstance';

export const cartApi = {
  create: async (): Promise<{ token: string; expires_at: string }> => {
    const response = await axiosInstance.post('/cart');
    return response.data.data;
  },
  get: async (): Promise<CartData> => {
    const response = await axiosInstance.get('/cart');
    return response.data.data;
  },
  addItem: async (productId: number, quantity: number): Promise<CartData> => {
    const response = await axiosInstance.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data.data;
  },
  updateItem: async (itemId: number, quantity: number): Promise<CartData> => {
    const response = await axiosInstance.patch(`/cart/items/${itemId}`, { quantity });
    return response.data.data;
  },
  removeItem: async (itemId: number): Promise<void> => {
    await axiosInstance.delete(`/cart/items/${itemId}`);
  },
};
```

### Checkout API Call with Idempotency Key
```typescript
// src/api/checkoutApi.ts
import { axiosInstance } from './axiosInstance';

export const checkoutApi = {
  submit: async (
    payload: CheckoutPayload,
    idempotencyKey: string,
  ) => {
    const response = await axiosInstance.post('/checkout', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return response.data.data; // OrderResource
  },
};
```

### AntD Product Card Pattern
```typescript
// src/components/customer/ProductCard.tsx
import { Card, Button, Tag, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

// stock_quantity = 0 → out of stock
const isOutOfStock = product.stock_quantity === 0;

<Card
  cover={<img src={product.primary_image?.thumbnail_url ?? '/placeholder.png'} />}
  actions={[
    <Button
      icon={<ShoppingCartOutlined />}
      disabled={isOutOfStock}
      onClick={() => onAddToCart(product.id)}
    >
      {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
    </Button>,
  ]}
>
  <Card.Meta title={product.name} />
  <Typography.Text strong>
    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price_vnd)}
  </Typography.Text>
  {isOutOfStock && <Tag color="error">Hết hàng</Tag>}
</Card>
```

### Checkout Form Validation Rules
```typescript
// Phone validation matches backend regex: /^0\d{9}$/
{
  customer_phone: [
    { required: true, message: 'Vui lòng nhập số điện thoại.' },
    { pattern: /^0\d{9}$/, message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.' },
  ],
  payment_method: [
    { required: true, message: 'Vui lòng chọn phương thức thanh toán.' },
  ],
}
```

---

## Sources

### Primary (HIGH confidence)
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/routes/api.php` — all route paths, middleware, idempotency usage
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Controllers/Public/ProductController.php` — product endpoints, query params, allowed filters
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Controllers/Public/CartController.php` — cart CRUD, X-Cart-Token contract
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Controllers/Public/CheckoutController.php` — checkout endpoint, note field absence confirmed
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Resources/*.php` — exact JSON field names and types
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Requests/CheckoutRequest.php` — validated fields, phone regex
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Presentation/Http/Middleware/ResolveCartToken.php` — cart token error codes and status codes
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/config/idempotency.php` — `IDEMPOTENCY_ENABLED=false` default, header name `Idempotency-Key`
- `d:/BANCHIMBOCAU/ban-chim-bo-cau-client/src/stores/cartStore.ts` — existing store shape (to be replaced)
- `d:/BANCHIMBOCAU/ban-chim-bo-cau-client/src/api/axiosInstance.ts` — existing interceptors
- `d:/BANCHIMBOCAU/ban-chim-bo-cau-client/src/router/index.tsx` — existing routes (to be extended)
- `d:/BANCHIMBOCAU/ban-chim-bo-cau-client/src/layouts/CustomerLayout.tsx` — cart badge reads from store (will break when store is refactored)
- `d:/BANCHIMBOCAU/ban-chim-bo-cau-client/package.json` — installed package versions confirmed

### Secondary (MEDIUM confidence)
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Domain/Order/Enums/PaymentMethod.php` — enum values `cod`, `chuyen_khoan`
- `d:/BANCHIMBOCAU/ban-chim-bo-cau/app/Domain/Order/Enums/OrderStatus.php` — order status values and Vietnamese labels

---

## Metadata

**Confidence breakdown:**
- Backend API contract: HIGH — read directly from source code
- Cart token strategy: HIGH — derived from ResolveCartToken middleware and CartController
- Product search gap: HIGH — confirmed by reading allowedFilters() call
- Category endpoint auth gap: HIGH — route is behind auth:sanctum with no public equivalent
- Note field gap: HIGH — confirmed by reading CheckoutRequest and PlaceOrderAction
- Frontend patterns (TanStack Query, AntD): HIGH — from CLAUDE.md stack decisions and Phase 1 codebase

**Research date:** 2026-03-29
**Valid until:** Until backend source changes (stable)
