# Feature Landscape

**Domain:** E-commerce SPA — niche product (pigeon / chim bo cau sales), React frontend with Laravel API backend
**Researched:** 2026-03-28
**Confidence:** HIGH (patterns are well-established; niche product changes content not mechanics)

---

## Table Stakes

Features users expect as baseline. Missing any of these = product feels broken or incomplete, users leave.

### Customer-Facing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product listing page (grid/list) | Entry point of every e-commerce site | Low | Paginated or infinite scroll; shows name, image, price |
| Product detail page | Users need full info before buying | Low-Med | Image gallery, description, breed/weight/age specs, price, stock status, Add-to-Cart CTA |
| Stock status indicator | "In stock / Out of stock / Only N left" | Low | Prevents rage-checkouts; pigeons are live inventory — critical |
| Search by keyword | Users arrive with intent | Low | Basic text search; filter by breed at minimum |
| Filter by category / breed | Pigeon shop likely has multiple breeds | Low | Sidebar or top-bar filters; breed + price range sufficient for v1 |
| Cart — add / remove / update quantity | Core purchase flow | Low | Persisted to localStorage (or server-side if auth required) |
| Cart summary / mini-cart | User always knows what's in cart | Low | Header badge count + slide-out or dedicated /cart page |
| Checkout form | Collect delivery info | Med | Name, phone, address, notes; COD only for v1 |
| Order confirmation page | Reassure user after submit | Low | Show order ID, summary, "we'll call you" message for offline payment |
| Login / Register pages | Session management | Low | Shared endpoint with admin per PROJECT.md |
| Persistent session (JWT) | User stays logged in on refresh | Low | localStorage + Axios interceptor; already in PROJECT.md |
| My orders / order history | Repeat customers need this | Med | List of past orders with status; requires auth |
| Order detail page | User tracks current order | Low | Read-only view of a single order |
| Responsive layout | Majority of Vietnamese users are mobile | Med | Ant Design Grid + CSS breakpoints; must test on 375px |
| Loading skeletons / spinners | Async API calls feel slow without feedback | Low | Ant Design Skeleton component; apply to all data-fetch pages |
| Error states | Network failure, 404, empty results | Low | Empty state components, toast notifications for API errors |
| Form validation (inline) | Prevent bad submissions | Low | Ant Design Form + rules; client-side only for v1 |

### Admin Panel

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dashboard with key metrics | Orientation at a glance | Low | Total products, total orders, orders today, pending orders count |
| Product list (table) | See all products at once | Low | Ant Design Table; sortable columns, pagination |
| Create product | Add new stock | Med | Form: name, breed, price, quantity, images, description |
| Edit product | Correct mistakes, update price/stock | Med | Same form pre-filled; inline stock update is particularly common |
| Delete / deactivate product | Remove unavailable items | Low | Soft-delete preferred (mark inactive) over hard-delete |
| Image upload for products | Product photos are essential | Med | Single or multiple images; upload to server, preview in form |
| Order list (table) | See all orders | Low | Ant Design Table; filter by status (pending/confirmed/shipping/done) |
| Order detail view | Understand what was ordered | Low | Read-only: items, quantities, customer info, total |
| Update order status | Fulfillment workflow | Low | Dropdown or button group: Pending → Confirmed → Shipped → Delivered → Cancelled |
| Admin auth / protected routes | Security — internal staff only | Low | Role check on React Router level + API-level enforcement |
| Logout | Session termination | Low | Clear JWT, redirect to login |

---

## Differentiators

Features not expected by default but that create competitive advantage for this niche pigeon shop.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Breed filter with photos | Pigeons are visually distinct; buyers shop by breed | Low | Breed taxonomy: Racing, Fancy, Meat, etc. Breed thumbnail in filter sidebar |
| Stock quantity visible on listing card | Pigeon stock is small-batch; scarcity drives decisions | Low | "Only 3 left" badge on product card |
| WhatsApp / Zalo contact button on product detail | Vietnamese niche buyers want to ask questions before buying | Low | Single `<a href="zalo://...">` or tel: link; no backend needed |
| Order status timeline on "My Orders" | Shows Pending → Confirmed → Shipped → Delivered visually | Low | Ant Design Steps component; data is already in order status field |
| Admin quick-edit inline stock | Staff adjust remaining quantity without opening full edit form | Med | Ant Design Table editable cell for quantity column |
| Basic sales chart on dashboard | Revenue or order count over last 7/30 days | Med | Recharts or Ant Design Charts; requires aggregation endpoint from Laravel |
| Product search autocomplete | Faster product discovery | Med | Debounced input hitting search API; Ant Design AutoComplete |
| "Related products" section on detail page | Upsell other breeds | Low | Static same-breed products from same API call; no recommendation engine |

---

## Anti-Features

Things to explicitly NOT build for v1. Each has a concrete reason and an alternative approach.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Payment gateway (VNPay, MoMo, Stripe) | Integration complexity is 2-3x checkout effort; requires merchant registration; COD is dominant for Vietnamese niche shops | Show bank transfer info or "Cash on Delivery" text at checkout confirmation |
| Product reviews / ratings | Requires moderation workflow; low value for a niche seller who sells via personal trust | Display WhatsApp/Zalo contact for social proof instead |
| Wishlist / saved items | Adds persistent data model; marginal conversion lift for small catalog | "Share product" link (copy URL) achieves similar outcome with zero backend |
| Real-time inventory via WebSocket | Pigeon inventory changes slowly; polling on page load is sufficient | Fetch fresh stock on product detail page load; show "contact to confirm availability" |
| Customer-facing promotions / coupon codes | Promo system requires discount logic, validation, admin UI for codes — disproportionate effort | Handle discounts offline (phone negotiation) for v1 |
| Multi-language (i18n) | Already out of scope per PROJECT.md; adds string extraction overhead to every feature | Vietnamese only; one string set, simpler code |
| SSR / SEO optimization | Already decided: Vite SPA, no Next.js; pigeon buyers find via Facebook/Zalo, not Google | Ensure OG meta tags manually on key pages for social sharing |
| Email / SMS notification to customer | Requires notification service setup (SendGrid, VIETTEL SMS); ORDER confirmation is manual call for v1 | Show order ID + "We will call you within 24h" on confirmation page |
| Complex admin role hierarchy (super-admin, editor, viewer) | Single internal staff team; over-engineered for v1 | One "admin" role with full access; role flag already in JWT from Laravel |
| Advanced analytics / BI dashboard | Disproportionate engineering for a small shop | Export orders as CSV for manual analysis in Excel/Sheets if needed |
| Product variants (size, color, cage-type) | Pigeons are sold as individual birds or pairs, not variant SKUs | Use separate product entries per breed/lot; simpler data model |
| Customer address book | Adds CRUD surface area; most customers order once | Collect address fresh per order in checkout form |

---

## Feature Dependencies

```
Auth (login + JWT persistence)
  └── My Orders page (requires user identity)
  └── Admin panel (all routes — requires admin role)
      └── Admin Dashboard
      └── Product CRUD
          └── Image Upload (sub-feature of Create/Edit)
      └── Order Management
          └── Order Detail View
          └── Update Order Status

Product Listing
  └── Search / Filter (enhances listing)
  └── Product Detail
      └── Add to Cart

Cart
  └── Checkout Form
      └── Order Confirmation Page
          └── My Orders (links back after confirmation)
```

Key ordering constraints:
- Auth must ship before any protected route (admin panel, my orders).
- Cart must exist before Checkout.
- Product Listing must exist before Product Detail (navigation target).
- Admin Product CRUD must exist before meaningful Order data (need products to create orders).

---

## MVP Recommendation

**Phase 1 — Foundation + Auth**
- Project scaffolding, routing, Axios/JWT setup
- Login page + role-based redirect
- Persistent session

**Phase 2 — Customer Core (buy flow)**
- Product Listing with basic filter
- Product Detail page
- Cart (add/remove/update, localStorage)
- Checkout form + Order Confirmation page

**Phase 3 — Admin Core (manage flow)**
- Admin Dashboard (counters only, no charts)
- Product CRUD + image upload
- Order list + detail + status update

**Phase 4 — Customer Account**
- My Orders + Order Detail (auth-gated)
- Loading/error states sweep across all pages

**Defer to v2:**
- Sales chart on dashboard (needs aggregation endpoint + charting library)
- Product search autocomplete (needs debounced API endpoint)
- WhatsApp/Zalo contact button (low effort, high value — can actually pull into Phase 2)
- Order status timeline (visual polish, data already exists)
- Admin inline stock quick-edit

**Note on WhatsApp/Zalo button:** Complexity is "Low" and value is high for this niche. Consider promoting from Differentiator to Phase 2 alongside Product Detail.

---

## Sources

- Project requirements: `D:/BANCHIMBOCAU/ban-chim-bo-cau-client/.planning/PROJECT.md`
- E-commerce UX patterns: training knowledge (HIGH confidence — patterns are stable and well-established across the industry)
- Vietnamese e-commerce context (COD dominance, Zalo preference): training knowledge (MEDIUM confidence — reflects 2024 market patterns; validate with team)
- Ant Design component availability for tables, forms, steps, skeleton: training knowledge (HIGH confidence — these are core AntD components stable since v4)
