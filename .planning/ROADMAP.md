# Roadmap: Ban Chim Bo Cau -- Frontend Client

**Milestone:** v1
**Granularity:** Coarse
**Created:** 2026-03-28
**Requirements coverage:** 46/46 v1 requirements mapped

---

## Phases

- [ ] **Phase 1: Foundation + Authentication** -- Project scaffold, infrastructure layers, and admin auth flow (login/logout/guest access) are production-ready; the entire app can be built on top
- [x] **Phase 2: Customer Purchase Flow** -- Any visitor (guest or logged-in) can browse products, manage a cart, and place a COD order end-to-end (completed 2026-03-29)
- [ ] **Phase 3: Admin Panel** -- Admin can manage the full product catalog and all orders through a protected internal interface
- [ ] **Phase 4: Account + Polish** -- Logged-in customers can view their order history; every surface has consistent loading states, error handling, and passes mobile audit

---

## Phase Details

### Phase 1: Foundation + Authentication
**Goal**: The project infrastructure is production-quality and admin auth flow works correctly -- any feature built on top will have reliable HTTP, state, routing, and session handling from day one
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. A developer can run `npm run dev` on a fresh clone and reach a working app with the correct API base URL loaded from `.env.development`
  2. An admin can log in with email/password, refresh the page, and remain logged in without being redirected to the login page
  3. An admin can log out and be immediately redirected; subsequent page visits require re-authentication
  4. AUTH-04 (customer registration) confirmed out of scope per D-13
  5. A guest (unauthenticated) visitor can navigate the public routes without being redirected to login; an attempt to reach a protected route redirects correctly based on role
**Plans:** 3/4 plans executed

Plans:
- [x] 01-01-PLAN.md -- Scaffold Vite project, install dependencies, create folder structure, env config, types, test infra
- [x] 01-02-PLAN.md -- Axios instance with interceptors, auth store, cart store, navigation service, AntD theme
- [x] 01-03-PLAN.md -- Router config, layouts (admin sidebar + customer navbar), protected routes, placeholder pages, App.tsx wiring
- [ ] 01-04-PLAN.md -- Auth API module, admin login page, AppInitializer wiring, human verification of complete auth flow

**UI hint**: yes

### Phase 2: Customer Purchase Flow
**Goal**: Any visitor -- guest or logged-in -- can browse the full product catalog, add items to a persistent cart, and complete a COD order with a confirmation receipt
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, CART-01, CART-02, CART-03, CART-04, CART-05, CHECKOUT-01, CHECKOUT-02, CHECKOUT-03
**Success Criteria** (what must be TRUE):
  1. A visitor can browse paginated products, filter by category, and search by name -- all without logging in
  2. A visitor can view a product detail page showing name, description, price, image, and current stock count; out-of-stock products display a clear status and the Add-to-Cart button is disabled
  3. A visitor can add products to the cart, update quantities, and remove items; the cart total updates in real time
  4. A visitor can refresh the page and find their cart items still present
  5. A visitor can fill in name, phone, address, and note, submit the checkout form, and see an order confirmation page with the order ID and summary
**Plans:** 4/4 plans complete

Plans:
- [x] 02-01-PLAN.md -- Types, API modules (product/cart/checkout), cartStore refactor to token-only, TanStack Query hooks
- [x] 02-02-PLAN.md -- Product listing page (HomePage), product detail page, ProductCard/Grid/CategoryFilter components
- [x] 02-03-PLAN.md -- Cart page with quantity controls, CartItemRow component, CustomerLayout badge update
- [x] 02-04-PLAN.md -- Checkout page with form validation, order confirmation page, route wiring, E2E verification

**UI hint**: yes

### Phase 3: Admin Panel
**Goal**: An admin user can manage the complete product catalog (CRUD + image upload) and handle all customer orders (view, filter, update status) through a dedicated protected interface
**Depends on**: Phase 2
**Requirements**: APROD-01, APROD-02, APROD-03, APROD-04, APROD-05, AORD-01, AORD-02, AORD-03, DASH-01, DASH-03
**Success Criteria** (what must be TRUE):
  1. An admin can view the dashboard and immediately see total new orders and product stock status (in-stock vs. out-of-stock count)
  2. An admin can create a new product (with image upload), edit it, and delete it with a confirmation dialog -- changes reflect immediately in the product list
  3. An admin can view all orders filtered by status, open a specific order to see full detail, and move it through the status workflow (pending -> confirmed -> shipping -> delivered, or cancelled)
**Plans:** 2/4 plans executed

Plans:
- [x] 03-01-PLAN.md -- Admin types, API modules (product/order/dashboard/category), TanStack Query hooks, unit tests
- [ ] 03-02-PLAN.md -- Dashboard page (stat cards with stock split), Product management page (table + CRUD modal + image upload + stock adjust), router wiring
- [x] 03-03-PLAN.md -- Order management page (filterable table + detail drawer + status workflow buttons), router wiring
- [ ] 03-04-PLAN.md -- Human verification of complete admin panel (dashboard, products, orders)

**UI hint**: yes

### Phase 4: Account + Polish
**Goal**: Logged-in customers can track their order history; every page in the app has consistent, production-quality loading states, error handling, and passes a mobile responsiveness check
**Depends on**: Phase 3
**Requirements**: ACCOUNT-01, ACCOUNT-02, UX-01, UX-02, UX-03, UX-04, DASH-02
**Success Criteria** (what must be TRUE):
  1. A logged-in customer can view a list of their past orders and open any order to see full detail (items, status, delivery address)
  2. Every data-fetching surface shows a loading indicator (spinner or skeleton) while the API call is in flight
  3. Every API error produces a visible, human-readable notification -- no silent failures or blank screens
  4. Every form shows inline validation errors before submission; the user knows exactly what to fix
  5. The app is fully usable on a 360px mobile viewport -- no horizontal scroll, no truncated actions, no overlapping UI elements
  6. Admin dashboard shows basic revenue figure (DASH-02 — deferred from Phase 3; requires backend revenue endpoint)
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Authentication | 3/4 | In Progress|  |
| 2. Customer Purchase Flow | 4/4 | Complete   | 2026-03-29 |
| 3. Admin Panel | 2/4 | In Progress|  |
| 4. Account + Polish | 0/? | Not started | - |

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| FOUND-07 | Phase 1 | Pending |
| FOUND-08 | Phase 1 | Pending |
| FOUND-09 | Phase 1 | Pending |
| FOUND-10 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 2 | Pending |
| PROD-03 | Phase 2 | Pending |
| PROD-04 | Phase 2 | Pending |
| PROD-05 | Phase 2 | Pending |
| PROD-06 | Phase 2 | Pending |
| CART-01 | Phase 2 | Pending |
| CART-02 | Phase 2 | Pending |
| CART-03 | Phase 2 | Pending |
| CART-04 | Phase 2 | Pending |
| CART-05 | Phase 2 | Pending |
| CHECKOUT-01 | Phase 2 | Pending |
| CHECKOUT-02 | Phase 2 | Pending |
| CHECKOUT-03 | Phase 2 | Pending |
| APROD-01 | Phase 3 | Pending |
| APROD-02 | Phase 3 | Pending |
| APROD-03 | Phase 3 | Pending |
| APROD-04 | Phase 3 | Pending |
| APROD-05 | Phase 3 | Pending |
| AORD-01 | Phase 3 | Pending |
| AORD-02 | Phase 3 | Pending |
| AORD-03 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 3 | Pending |
| ACCOUNT-01 | Phase 4 | Pending |
| ACCOUNT-02 | Phase 4 | Pending |
| UX-01 | Phase 4 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 4 | Pending |

**Total mapped: 46/46 v1 requirements**

---

*Roadmap created: 2026-03-28*
*Phase 1 planned: 2026-03-28*
*Phase 2 planned: 2026-03-29*
*Phase 3 planned: 2026-03-29*
*Phase 3 revised: 2026-03-29 (DASH-02 deferred to Phase 4 — backend lacks revenue endpoint)*
*Next: `/gsd:execute-phase 03`*
