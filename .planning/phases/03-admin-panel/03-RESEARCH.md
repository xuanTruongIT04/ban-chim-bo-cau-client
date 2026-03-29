# Phase 3: Admin Panel — Research

**Researched:** 2026-03-29
**Domain:** React SPA — admin CRUD interface (products, orders, dashboard) consuming Laravel REST API
**Confidence:** HIGH (all API contracts read directly from backend source; all frontend infrastructure verified from Phase 1 & 2 artifacts)

---

## Summary

Phase 3 builds the complete admin panel on top of the Phase 1 & 2 foundation. The backend is fully implemented for all 11 requirements in scope. Every API endpoint has been verified by reading controller source, Request validation rules, and Resource response shapes directly. No guesswork is required — this research is grounded entirely in live code.

The admin panel has three surfaces: a **Dashboard** (stat cards showing orders by status), a **Product management** page (paginated table, create/edit modal, image upload, stock adjustment), and an **Order management** page (filterable table, order detail drawer, status transition buttons). All three surfaces share the same infrastructure: `axiosInstance` with Bearer token injection, TanStack Query for server state, Ant Design 5 for components.

The most important architectural insight for this phase is **how image upload must be handled**. The backend accepts `multipart/form-data` (not JSON) for `POST /admin/products/{id}/images`. The existing `axiosInstance` has `Content-Type: application/json` as its default. Image upload calls must override this header. Ant Design's `<Upload>` component with `customRequest` is the correct integration pattern — it gives full control over the axios call, allowing the header to be set correctly per-request without modifying the global instance.

The second critical insight is the **order status state machine**. The backend enforces transitions strictly: `cho_xac_nhan` → `xac_nhan`, `dang_giao`, or `huy`; `xac_nhan` → `cho_xac_nhan` (back-step), `dang_giao`, or `huy`; `dang_giao` → `xac_nhan` (back-step), `hoan_thanh`, or `huy`; `hoan_thanh` → nothing (terminal); `huy` → nothing (terminal). Cancellation uses a separate endpoint (`POST /admin/orders/{id}/cancel`), not the `PATCH /admin/orders/{id}/status` endpoint. The UI must mirror this exactly — only show legal next-state buttons for each order's current status.

**Primary recommendation:** Build in this order: (1) adminApi module + TypeScript types, (2) Dashboard stat cards, (3) Product list table + CRUD modal + image upload, (4) Order list table + detail drawer + status workflow. Each surface is independently deployable.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| APROD-01 | Admin views all products with pagination | `GET /api/v1/admin/products` — paginated, includes inactive; `ProductResource` shape verified |
| APROD-02 | Admin creates new product (name, desc, price, qty, category, image) | `POST /api/v1/admin/products` — body params verified from `CreateProductRequest`; image is separate upload step via `POST /admin/products/{id}/images` |
| APROD-03 | Admin edits product info | `PUT /api/v1/admin/products/{id}` — `UpdateProductRequest` rules verified; name required, others optional |
| APROD-04 | Admin deletes product with confirmation dialog | `DELETE /api/v1/admin/products/{id}` — returns 204; AntD `Modal.confirm` for the confirmation dialog |
| APROD-05 | Admin uploads product image | `POST /api/v1/admin/products/{id}/images` — `multipart/form-data`; accepts `image` (file, 5MB max) + `is_primary` boolean; S3 backend, returns URL |
| AORD-01 | Admin views all orders filtered by status | `GET /api/v1/admin/orders` — `filter[status]`, `filter[search]`, `filter[date_from]`, `filter[date_to]`, `sort`, `page`, `per_page` query params verified |
| AORD-02 | Admin views order detail | `GET /api/v1/admin/orders/{id}` — full `OrderResource` with `items[]` array verified |
| AORD-03 | Admin updates order status through workflow | `PATCH /api/v1/admin/orders/{id}/status` (body: `{status}`) + `POST /admin/orders/{id}/cancel`; state machine transitions verified from `OrderStatus` enum |
| DASH-01 | Admin sees total new orders (today/this week) | `GET /api/v1/admin/dashboard` returns `orders_by_status` object with counts per status; `cho_xac_nhan` count = "new/pending" |
| DASH-02 | Admin sees basic revenue figure | Dashboard endpoint returns order counts only; total revenue requires summing `total_amount` from order list OR a backend change — see Open Questions |
| DASH-03 | Admin sees product stock status (in-stock vs. out-of-stock count) | Product stock status requires `GET /api/v1/admin/products` and computing in-stock/out-of-stock counts client-side, OR a backend stats endpoint |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: Vite 6, React 18.3 (NOT 19), TypeScript strict mode
- **UI Library**: Ant Design 5 — use built-in Table (server-side pagination), Form, Modal, Drawer, Upload, Descriptions, Tag, Statistic components
- **State Management**: Zustand 5 with `persist` middleware (auth state already wired)
- **Data Fetching**: TanStack Query v5 for all server state — useQuery for reads, useMutation for writes
- **HTTP**: axios via existing `axiosInstance` — do NOT create a second axios instance
- **Forms**: Ant Design `Form` with `rules` prop — do NOT introduce React Hook Form
- **Routing**: React Router v6 — extend existing `router/index.tsx`; replace `PlaceholderPage` stubs for `/admin/products` and `/admin/orders`
- **No SSR**: Vite SPA only
- **GSD Workflow**: All file changes go through GSD execute-phase workflow

---

## Backend API Contract (Source of Truth)

All routes verified from `routes/api.php`. All request shapes verified from `app/Presentation/Http/Requests/`. All response shapes verified from `app/Presentation/Http/Resources/`. Base URL prefix: `/api/v1`.

All admin routes require `Authorization: Bearer {token}` (Sanctum). The `axiosInstance` already injects this automatically.

### Admin Product Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/products` | Bearer | Paginated list (includes inactive). Params: `page`, `per_page` (default 20) |
| POST | `/admin/products` | Bearer | Create product. Body: `name*`, `description?`, `price_vnd*`, `unit_type*` (con\|kg), `category_id*`, `stock_quantity?`, `is_active?` |
| GET | `/admin/products/{id}` | Bearer | Single product detail (ProductDetailResource — includes all images, category) |
| PUT | `/admin/products/{id}` | Bearer | Update product. Body: `name*`, `description?`, `price_vnd?`, `unit_type?`, `category_id?`, `is_active?` |
| DELETE | `/admin/products/{id}` | Bearer | Delete product + all images. Returns 204 |
| PATCH | `/admin/products/{id}/toggle-active` | Bearer | Toggle active/inactive |
| POST | `/admin/products/{id}/images` | Bearer | Upload image. `multipart/form-data`. Fields: `image*` (file, JPEG/PNG/WebP, max 5MB), `is_primary?` (boolean) |
| PATCH | `/admin/products/{id}/images/{imageId}/primary` | Bearer | Set image as primary |
| DELETE | `/admin/products/{id}/images/{imageId}` | Bearer | Delete one image |
| GET | `/admin/products/{id}/stock-adjustments` | Bearer | List stock history. Params: `page`, `per_page` (default 15) |
| POST | `/admin/products/{id}/stock-adjustments` | Bearer | Adjust stock. Body: `delta*` (numeric), `adjustment_type*` (nhap_hang\|kiem_ke\|hu_hong\|khac), `note?` |

**CRITICAL — Image upload header:** `Content-Type` must be `multipart/form-data` (NOT `application/json`). The `axiosInstance` default header is `application/json`. Override per-request using AntD Upload `customRequest` with FormData:

```typescript
// In customRequest callback:
const formData = new FormData();
formData.append('image', file);
// Do NOT set Content-Type manually — let the browser set it with the boundary
await axiosInstance.post(`/admin/products/${productId}/images`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### Admin Category Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/categories` | Full category tree with children (2-level max). Already used by Phase 2 `useCategories` hook |
| POST | `/admin/categories` | Create. Body: `name*`, `slug*`, `parent_id?`, `description?`, `sort_order?`, `is_active?` |
| GET | `/admin/categories/{id}` | Single category |
| PUT | `/admin/categories/{id}` | Update. Same body as create |
| DELETE | `/admin/categories/{id}` | Delete. Cannot delete if category has products |

### Admin Order Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/orders` | Filtered + paginated list. Params: `filter[status]`, `filter[search]`, `filter[date_from]`, `filter[date_to]`, `sort` (-created_at default), `page`, `per_page` (20) |
| GET | `/admin/orders/{id}` | Full order detail with items array |
| PATCH | `/admin/orders/{id}/status` | Update status. Body: `status` — valid values: `cho_xac_nhan`, `xac_nhan`, `dang_giao`, `hoan_thanh`. DO NOT use for cancel |
| POST | `/admin/orders/{id}/cancel` | Cancel order + restore stock. No body required |
| PATCH | `/admin/orders/{id}/payment-status` | Confirm payment (→ da_thanh_toan). No body required |
| PATCH | `/admin/orders/{id}/delivery-method` | Set delivery method. Body: `delivery_method` (noi_tinh\|ngoai_tinh) |

### Dashboard Endpoint

| Method | Path | Response Shape |
|--------|------|----------------|
| GET | `/admin/dashboard` | `{ success: true, data: { orders_by_status: { cho_xac_nhan: N, xac_nhan: N, dang_giao: N, hoan_thanh: N, huy: N } } }` |

**Dashboard gap:** The endpoint returns ONLY order counts by status. There is NO revenue figure and NO product stock summary in the response. See Open Questions for recommended approach.

---

## Response Shapes (Verified from Resource classes)

### ProductResource (list item)
```typescript
{
  id: number;
  name: string;
  description: string | null;
  price_vnd: number;
  unit_type: 'con' | 'kg';
  category_id: number;
  stock_quantity: string;       // decimal string e.g. "50.000"
  is_active: boolean;
  primary_image: {              // null if no images
    url: string;
    thumbnail_url: string;
  } | null;
  created_at: string;
  updated_at: string;
}
```

### ProductDetailResource (single product)
```typescript
{
  id: number;
  name: string;
  description: string | null;
  price_vnd: number;
  unit_type: 'con' | 'kg';
  category_id: number;
  category: { id: number; name: string; slug: string; parent_id: number | null; ... };
  stock_quantity: string;
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
  url: string;           // full S3 URL
  thumbnail_url: string; // full S3 thumbnail URL
  is_primary: boolean;
  sort_order: number;
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
  children: CategoryResource[]; // empty array for leaf nodes
  created_at: string;
  updated_at: string;
}
```

### OrderResource
```typescript
{
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: 'cho_xac_nhan' | 'xac_nhan' | 'dang_giao' | 'hoan_thanh' | 'huy';
  order_status_label: string;        // Vietnamese: "Chờ xác nhận", "Xác nhận", etc.
  payment_method: 'cod' | 'chuyen_khoan';
  payment_method_label: string;
  payment_status: 'chua_thanh_toan' | 'da_thanh_toan';
  payment_status_label: string;
  delivery_method: 'noi_tinh' | 'ngoai_tinh' | null;
  delivery_method_label: string | null;
  total_amount: string;              // IMPORTANT: string (e.g. "170000.00"), not number
  created_by: number | null;
  items: OrderItemResource[];
  created_at: string;
  updated_at: string;
}
```

**IMPORTANT:** `total_amount` is a decimal string. Use `parseFloat(order.total_amount)` before passing to `formatVND()`.

### OrderItemResource
```typescript
{
  id: number;
  product_id: number;
  product_name: string;
  price_vnd: number;
  quantity: string;              // decimal string e.g. "2.000"
  subtotal_vnd: number;
}
```

### StockAdjustmentResource
```typescript
{
  id: number;
  product_id: number;
  admin_user_id: number;
  delta: string;                 // decimal string
  adjustment_type: 'nhap_hang' | 'kiem_ke' | 'hu_hong' | 'khac';
  note: string | null;
  stock_before: string;          // decimal string
  stock_after: string;           // decimal string
  created_at: string;
}
```

### DashboardData
```typescript
{
  success: true;
  data: {
    orders_by_status: {
      cho_xac_nhan: number;
      xac_nhan: number;
      dang_giao: number;
      hoan_thanh: number;
      huy: number;
    };
  };
}
```

---

## Order Status State Machine

Verified from `app/Domain/Order/Enums/OrderStatus.php`:

```
cho_xac_nhan → xac_nhan (PATCH /status)
cho_xac_nhan → huy      (POST /cancel)

xac_nhan → cho_xac_nhan (PATCH /status — back-step)
xac_nhan → dang_giao    (PATCH /status)
xac_nhan → huy          (POST /cancel)

dang_giao → xac_nhan    (PATCH /status — back-step)
dang_giao → hoan_thanh  (PATCH /status)
dang_giao → huy         (POST /cancel)

hoan_thanh → (terminal — no transitions)
huy         → (terminal — no transitions)
```

**UI rendering rule:** For a given `order_status`, only show buttons for legal next states. Use a map:

```typescript
const NEXT_STATES: Record<string, string[]> = {
  cho_xac_nhan: ['xac_nhan'],
  xac_nhan:     ['cho_xac_nhan', 'dang_giao'],
  dang_giao:    ['xac_nhan', 'hoan_thanh'],
  hoan_thanh:   [],
  huy:          [],
};

const CAN_CANCEL = ['cho_xac_nhan', 'xac_nhan', 'dang_giao'];
```

Status labels and color map for AntD `<Tag>`:

| Status value | Vietnamese label | AntD Tag color |
|---|---|---|
| cho_xac_nhan | Chờ xác nhận | orange |
| xac_nhan | Xác nhận | blue |
| dang_giao | Đang giao | geekblue |
| hoan_thanh | Hoàn thành | green |
| huy | Hủy | red |

---

## Standard Stack

All packages are already installed from Phase 1. No new dependencies required for Phase 3.

### Core (all already installed)
| Library | Version | Purpose |
|---------|---------|---------|
| antd | ^5.20 | Table, Form, Modal, Drawer, Upload, Statistic, Tag, Descriptions |
| @ant-design/icons | ^5.4 | EditOutlined, DeleteOutlined, PlusOutlined, etc. |
| @tanstack/react-query | ^5.51 | useQuery for reads, useMutation for writes, queryClient.invalidateQueries |
| axios | ^1.7 | HTTP via existing axiosInstance |
| zustand | ^5.0 | Auth state (already wired) |
| react-router-dom | ^6.26 | Replace PlaceholderPage stubs with real pages |

### No New Packages Required

The full stack for Phase 3 is already installed. `@ant-design/plots` (charts) was listed as OPTIONAL in the stack spec and is a v2 feature (ADASH-V2-01). Do NOT install it for Phase 3.

---

## Architecture Patterns

### Recommended File Structure for Phase 3

```
src/
├── api/
│   └── admin/
│       ├── adminProductApi.ts    # Products CRUD + image + stock endpoints
│       ├── adminOrderApi.ts      # Orders list, detail, status update, cancel
│       ├── adminCategoryApi.ts   # Categories CRUD
│       └── adminDashboardApi.ts  # Dashboard stats
├── hooks/
│   └── admin/
│       ├── useAdminProducts.ts   # TanStack Query hooks for product operations
│       ├── useAdminOrders.ts     # TanStack Query hooks for order operations
│       └── useAdminDashboard.ts  # TanStack Query hook for dashboard stats
├── types/
│   └── api.ts                   # Extend with AdminProductResource, OrderListItem, DashboardStats, etc.
├── pages/
│   └── admin/
│       ├── DashboardPage.tsx     # Replace stub — stat cards + product stock summary
│       ├── ProductsPage.tsx      # Replace PlaceholderPage — table + modal
│       └── OrdersPage.tsx        # Replace PlaceholderPage — table + drawer
└── components/
    └── admin/
        ├── ProductFormModal.tsx  # Create/edit product form (AntD Form in Modal)
        ├── ProductImageUpload.tsx # AntD Upload with customRequest + S3 URLs
        ├── StockAdjustModal.tsx  # Stock adjustment form in Modal
        ├── OrderDetailDrawer.tsx # Full order detail in right-side Drawer
        └── OrderStatusButtons.tsx # Dynamic status transition buttons
```

### Pattern 1: Admin API Module (adminProductApi)

```typescript
// src/api/admin/adminProductApi.ts
import { axiosInstance } from '../axiosInstance';
import type { PaginatedResponse, AdminProductResource, CreateProductPayload } from '../../types/api';

export const adminProductApi = {
  list: async (params: { page?: number; per_page?: number }) =>
    axiosInstance.get<PaginatedResponse<AdminProductResource>>('/admin/products', { params })
      .then(r => r.data),

  getById: async (id: number) =>
    axiosInstance.get(`/admin/products/${id}`).then(r => r.data.data),

  create: async (payload: CreateProductPayload) =>
    axiosInstance.post('/admin/products', payload).then(r => r.data.data),

  update: async (id: number, payload: Partial<CreateProductPayload>) =>
    axiosInstance.put(`/admin/products/${id}`, payload).then(r => r.data.data),

  delete: async (id: number) =>
    axiosInstance.delete(`/admin/products/${id}`),

  uploadImage: async (productId: number, file: File, isPrimary = false) => {
    const formData = new FormData();
    formData.append('image', file);
    if (isPrimary) formData.append('is_primary', 'true');
    return axiosInstance.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data);
  },

  deleteImage: async (productId: number, imageId: number) =>
    axiosInstance.delete(`/admin/products/${productId}/images/${imageId}`),
};
```

### Pattern 2: TanStack Query Admin Hooks

```typescript
// src/hooks/admin/useAdminProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductApi } from '../../api/admin/adminProductApi';

export const ADMIN_PRODUCTS_KEY = 'admin-products';

export function useAdminProducts(params: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [ADMIN_PRODUCTS_KEY, params],
    queryFn: () => adminProductApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminProductApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY] }),
  });
}
```

### Pattern 3: AntD Table with Server-Side Pagination

```typescript
// In ProductsPage.tsx
const [page, setPage] = useState(1);
const { data, isLoading } = useAdminProducts({ page, per_page: 20 });

<Table
  dataSource={data?.data}
  loading={isLoading}
  rowKey="id"
  pagination={{
    current: data?.meta.current_page,
    pageSize: data?.meta.per_page,
    total: data?.meta.total,
    onChange: setPage,
    showSizeChanger: false,
  }}
  columns={columns}
/>
```

### Pattern 4: AntD Form in Modal (Create/Edit Product)

```typescript
// ProductFormModal.tsx — single component handles both create and edit
// When editingProduct is null/undefined → create mode
// When editingProduct is set → edit mode, form pre-populated via useEffect

const [form] = Form.useForm();

useEffect(() => {
  if (editingProduct) {
    form.setFieldsValue(editingProduct);
  } else {
    form.resetFields();
  }
}, [editingProduct, form]);

// CRITICAL: Unmount modal content when closed (not hide)
// AntD Modal: use destroyOnClose prop OR manually call form.resetFields() on close
<Modal destroyOnClose onCancel={onClose} ...>
  <Form form={form} onFinish={handleSubmit} layout="vertical">
    ...
  </Form>
</Modal>
```

### Pattern 5: Image Upload with AntD Upload + customRequest

```typescript
// ProductImageUpload.tsx
<Upload
  listType="picture-card"
  customRequest={async ({ file, onSuccess, onError }) => {
    try {
      const result = await adminProductApi.uploadImage(productId, file as File);
      onSuccess?.(result);
      queryClient.invalidateQueries({ queryKey: [ADMIN_PRODUCTS_KEY, productId] });
    } catch (err) {
      onError?.(err as Error);
      message.error('Upload ảnh thất bại');
    }
  }}
  accept="image/jpeg,image/png,image/webp"
  maxCount={5}
>
  <PlusOutlined /> Upload
</Upload>
```

### Pattern 6: Order Detail in Right Drawer

```typescript
// OrderDetailDrawer.tsx
<Drawer
  open={!!selectedOrderId}
  onClose={() => setSelectedOrderId(null)}
  width={560}
  title={`Đơn hàng #${selectedOrderId}`}
>
  {/* Descriptions for customer info */}
  {/* Table for order items */}
  {/* OrderStatusButtons for state transitions */}
</Drawer>
```

### Pattern 7: Order Status Transitions

```typescript
// OrderStatusButtons.tsx — renders correct buttons per current status
const FORWARD_TRANSITIONS: Record<string, { status: string; label: string; type: ButtonType }[]> = {
  cho_xac_nhan: [{ status: 'xac_nhan', label: 'Xác nhận đơn', type: 'primary' }],
  xac_nhan:     [
    { status: 'dang_giao', label: 'Bắt đầu giao', type: 'primary' },
    { status: 'cho_xac_nhan', label: 'Trả về chờ', type: 'default' },
  ],
  dang_giao:    [
    { status: 'hoan_thanh', label: 'Hoàn thành', type: 'primary' },
    { status: 'xac_nhan', label: 'Trả về xác nhận', type: 'default' },
  ],
  hoan_thanh:   [],
  huy:          [],
};

// Cancel button shown for cho_xac_nhan, xac_nhan, dang_giao
// Uses POST /cancel endpoint, NOT the PATCH /status endpoint
```

### Anti-Patterns to Avoid

- **Stale modal form state:** Never use `display: none` to hide AntD Form modals. Use `destroyOnClose` prop or `form.resetFields()` in `afterClose` callback — otherwise form shows previous product's data when reopened.
- **Content-Type override on all requests:** Only override `Content-Type: multipart/form-data` on the specific image upload call. Do NOT modify the global axiosInstance headers — that would break all JSON endpoints.
- **Using PATCH /status to cancel:** The `UpdateOrderStatusRequest` validates `status` as `in:cho_xac_nhan,xac_nhan,dang_giao,hoan_thanh` — "huy" is intentionally excluded. Always use `POST /admin/orders/{id}/cancel` for cancellation.
- **Manual total_amount parsing:** `total_amount` in `OrderResource` is a string (e.g. `"170000.00"`). Always use `parseFloat(order.total_amount)` before arithmetic or passing to `formatVND()`.
- **AntD bundle bloat:** Admin pages are already behind a `ProtectedRoute`. Optionally use `React.lazy()` for `ProductsPage` and `OrdersPage` to split admin bundle — not required but useful.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table with server pagination | Custom table + pagination logic | AntD `<Table pagination={{ total, current, onChange }}>` | Server-side pagination, column config, loading state, row keys are all built-in |
| Form create/edit mode | Two separate form components | Single AntD `<Form>` + `form.setFieldsValue()` for edit, `form.resetFields()` for create | `Form.useForm()` handles both modes cleanly |
| Delete confirmation | Custom dialog | `Modal.confirm({ title, content, onOk })` | One-liner; handles keyboard events, focus trap |
| Image file validation | Manual File.size / File.type checks | AntD `Upload` `beforeUpload` prop | Returns false to cancel upload, shows built-in error |
| Status badge rendering | Custom span with className | AntD `<Tag color="...">` | Consistent with the rest of the admin UI |
| Currency formatting | Hand-rolled formatter | `formatVND()` from `src/utils/format.ts` (already exists) | Consistent with Phase 2 formatting |
| Optimistic updates | Custom state management | TanStack Query `useMutation` `onSuccess: () => qc.invalidateQueries(...)` | Cache invalidation is handled; no manual state sync needed |

---

## Existing Infrastructure to Reuse

### Phase 1 & 2 Infrastructure

| Artifact | Location | How Phase 3 Uses It |
|----------|----------|---------------------|
| `axiosInstance` | `src/api/axiosInstance.ts` | All admin API calls; Bearer token injected automatically |
| `useAuthStore` | `src/stores/authStore.ts` | `token`, `user.name` already available; no changes needed |
| `AdminLayout` | `src/layouts/AdminLayout.tsx` | Already has sidebar nav with Products/Orders/Dashboard links; no changes needed |
| `AdminRoute` | `src/components/common/AdminRoute.tsx` | All admin pages already wrapped in this protected route |
| `router/index.tsx` | `src/router/index.tsx` | Replace `PlaceholderPage` stubs for `/admin/products` and `/admin/orders` |
| `DashboardPage.tsx` | `src/pages/admin/DashboardPage.tsx` | Currently a stub — replace with stat cards |
| `formatVND` | `src/utils/format.ts` | Use for all price display in admin pages |
| `PaginatedResponse<T>` | `src/types/api.ts` | Reuse generic pagination type; add Admin-specific types |
| `CategoryResource` | `src/types/api.ts` | Already defined; reuse for category dropdown in product form |
| `OrderResource`, `OrderItemResource` | `src/types/api.ts` | Already defined from Phase 2 checkout |

### Types to Add to `src/types/api.ts`

```typescript
// Admin-specific product type (list view — includes category_id, stock, is_active)
// Note: ProductResource in api.ts is already suitable; verify it includes all needed fields
// AdminProductDetail = ProductDetailResource already typed as ProductDetailResource

// Create/Update product payload
export interface CreateProductPayload {
  name: string;
  description?: string | null;
  price_vnd: number;
  unit_type: 'con' | 'kg';
  category_id: number;
  stock_quantity?: string;
  is_active?: boolean;
}

// Dashboard stats
export interface DashboardStats {
  orders_by_status: {
    cho_xac_nhan: number;
    xac_nhan: number;
    dang_giao: number;
    hoan_thanh: number;
    huy: number;
  };
}

// Stock adjustment
export interface StockAdjustmentResource {
  id: number;
  product_id: number;
  admin_user_id: number;
  delta: string;
  adjustment_type: 'nhap_hang' | 'kiem_ke' | 'hu_hong' | 'khac';
  note: string | null;
  stock_before: string;
  stock_after: string;
  created_at: string;
}

export interface AdjustStockPayload {
  delta: number;
  adjustment_type: 'nhap_hang' | 'kiem_ke' | 'hu_hong' | 'khac';
  note?: string;
}

// Order filter params
export interface AdminOrderListParams {
  'filter[status]'?: string;
  'filter[search]'?: string;
  'filter[date_from]'?: string;
  'filter[date_to]'?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}
```

---

## Common Pitfalls

### Pitfall 1: Image Upload Breaking JSON Requests
**What goes wrong:** Setting `axiosInstance.defaults.headers['Content-Type'] = 'multipart/form-data'` globally breaks all JSON endpoints.
**Why it happens:** Developer sees the upload needs a different Content-Type and modifies the shared instance.
**How to avoid:** Pass `{ headers: { 'Content-Type': 'multipart/form-data' } }` only on the specific upload call. When using FormData, the browser automatically adds the `boundary` parameter — do NOT manually set `multipart/form-data` without letting the browser add the boundary, or the server will reject it. Instead, omit Content-Type and let axios/browser handle it when FormData is detected:
```typescript
// Recommended: let axios detect FormData and set header automatically
axiosInstance.post(`/admin/products/${id}/images`, formData);
// axios will set multipart/form-data + boundary automatically when body is FormData
```
**Warning signs:** All API calls after an image upload return 422 or parse errors.

### Pitfall 2: Using PATCH /status for Cancellation
**What goes wrong:** Developer sends `PATCH /admin/orders/{id}/status` with `{ status: 'huy' }` — backend returns 422.
**Why it happens:** `UpdateOrderStatusRequest` validates status as `in:cho_xac_nhan,xac_nhan,dang_giao,hoan_thanh`. The value `huy` is intentionally excluded.
**How to avoid:** Always use the dedicated `POST /admin/orders/{id}/cancel` endpoint for cancellation.
**Warning signs:** 422 response with "Trang thai khong hop le" when sending huy status.

### Pitfall 3: Stale Form Data in Reopened Modals
**What goes wrong:** Admin edits product A, closes modal, opens product B — product A's data is still in the form.
**Why it happens:** AntD Form keeps internal state even when Modal is visually closed unless explicitly reset.
**How to avoid:** Add `destroyOnClose` to `<Modal>`. OR call `form.resetFields()` in the Modal's `afterClose` callback. NOT in `onCancel` — the modal may still be animating.
**Warning signs:** Form shows different product's data when opened for a new product.

### Pitfall 4: total_amount Arithmetic on String
**What goes wrong:** `order.total_amount * 1000` returns `NaN` or incorrect concatenation.
**Why it happens:** `OrderResource.total_amount` is a string from the backend (e.g. `"170000.00"`).
**How to avoid:** Use `parseFloat(order.total_amount)` before all arithmetic and before passing to `formatVND()`.
**Warning signs:** Dashboard revenue shows NaN or values like "170000.00170000.00".

### Pitfall 5: Order List Table Missing Stable Row Keys
**What goes wrong:** AntD warns "Each child in a list should have a unique key prop"; sorting/filtering causes visual glitches.
**Why it happens:** `dataSource` passed without `rowKey` or with a non-unique field.
**How to avoid:** Always set `rowKey="id"` on AntD `<Table>`.

### Pitfall 6: Dashboard DASH-02/DASH-03 Data Not in Dashboard Endpoint
**What goes wrong:** Developer expects revenue and stock counts from `GET /admin/dashboard` — they are not there.
**Why it happens:** The backend dashboard endpoint only returns order counts by status.
**How to avoid:** See Open Questions for recommended approach.

---

## Code Examples

### Delete Confirmation Pattern
```typescript
// Source: AntD documentation, verified working pattern from existing AntD usage in project
const handleDelete = (product: AdminProductResource) => {
  Modal.confirm({
    title: 'Xóa sản phẩm',
    content: `Bạn có chắc muốn xóa "${product.name}"? Thao tác này không thể hoàn tác.`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: () => deleteProduct.mutateAsync(product.id),
  });
};
```

### Server-Side Filtered Order Table
```typescript
// Params state drives both AntD Table and API query
const [filters, setFilters] = useState<AdminOrderListParams>({
  sort: '-created_at',
  page: 1,
  per_page: 20,
});
const { data, isLoading } = useAdminOrders(filters);

// Status filter via AntD Select (not Table column filter — server-side)
<Select
  allowClear
  placeholder="Lọc theo trạng thái"
  onChange={(value) => setFilters(f => ({ ...f, 'filter[status]': value, page: 1 }))}
>
  <Select.Option value="cho_xac_nhan">Chờ xác nhận</Select.Option>
  ...
</Select>
```

### Mutation with Cache Invalidation
```typescript
// Source: TanStack Query v5 pattern used throughout Phase 2
const qc = useQueryClient();
const updateStatus = useMutation({
  mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
    adminOrderApi.updateStatus(orderId, status),
  onSuccess: (_, { orderId }) => {
    // Invalidate both list and detail
    qc.invalidateQueries({ queryKey: ['admin-orders'] });
    qc.invalidateQueries({ queryKey: ['admin-order', orderId] });
    message.success('Cập nhật trạng thái thành công');
  },
  onError: () => {
    message.error('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
  },
});
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|---|---|---|
| Separate create/edit forms | Single AntD Form + `form.setFieldsValue()` | Halves component count; consistent validation |
| `window.confirm()` for delete | `Modal.confirm()` | Consistent AntD styling; keyboard accessible |
| Manual file upload with fetch | AntD Upload `customRequest` + axios | Progress indication, file list management built-in |
| Polling for order updates | TanStack Query `staleTime` + manual refresh | Cache invalidation on mutation is sufficient for this use case |

---

## Open Questions

### 1. Dashboard DASH-02: Revenue Figure Source

**What we know:** `GET /admin/dashboard` only returns `orders_by_status` counts. There is NO `total_revenue` field.

**What's unclear:** Requirements say "tổng doanh thu cơ bản" — how to implement without a backend stats endpoint.

**Recommendation:** Two options, ordered by preference:
1. **Option A (preferred):** Add a dedicated backend endpoint or extend the dashboard endpoint to return `total_revenue_today` and `total_revenue_month`. This is a 1-2 hour backend change and gives a real number.
2. **Option B (frontend-only fallback):** Make a second call to `GET /admin/orders?filter[status]=hoan_thanh&per_page=1` to get the total count of completed orders, and display that count rather than a revenue figure. Not revenue, but informative.
3. **Option C (deferred):** Show only DASH-01 and DASH-03 in the dashboard; mark DASH-02 as "coming soon" with a placeholder card. Requires a plan-time decision.

### 2. Dashboard DASH-03: Product Stock Status

**What we know:** `GET /admin/dashboard` has no product stock data. `GET /admin/products` returns paginated products with `stock_quantity` and `is_active`.

**What's unclear:** Getting accurate in-stock/out-of-stock counts without fetching all pages.

**Recommendation:** Two options:
1. **Option A (preferred):** Add a backend endpoint or extend dashboard to return `{ in_stock_count: N, out_of_stock_count: N }`.
2. **Option B (frontend-only):** Make a second call to `GET /admin/products?per_page=1&page=1` to get `meta.total`, and display total product count only. Not stock status, but shows total product count.
3. **Option C:** Fetch all products (no per_page limit — may be slow for large catalogs). Only viable for small datasets.

**Recommended combined resolution:** One backend PR to extend `/admin/dashboard` to also return `{ total_revenue_all_time, in_stock_count, out_of_stock_count }` would resolve both DASH-02 and DASH-03 cleanly. Raise this with the backend team before Phase 3 planning finalizes.

### 3. Stock Adjustment Scope

**What we know:** `APROD-05` covers image upload. The backend has full stock adjustment API (`POST /admin/products/{id}/stock-adjustments`).

**What's unclear:** Whether the plan should include a stock adjustment UI (adjust stock button + modal) or just display `stock_quantity` as read-only data.

**Recommendation:** Include a basic stock adjustment button in the product table row (or product detail) for `nhap_hang` (add stock). This directly enables the business use case (admin receives birds, needs to update stock). `hu_hong` and `khac` can be deferred. This is not a hard requirement but aligns with the phase goal of "complete product catalog management."

---

## Environment Availability

Step 2.6: The phase has no new external dependencies beyond those already used in Phase 1 & 2. All tools are available.

| Dependency | Required By | Available | Notes |
|---|---|---|---|
| Laravel backend on localhost:8000 | All admin API calls | Conditional | Must be running for live testing; not needed for unit tests |
| Vitest | Testing | ✓ | Already configured in `vitest.config.ts` |
| Node.js | Build | ✓ | Already in use |

---

## Validation Architecture

Test framework is Vitest ^2.1 with jsdom environment.

**Config file:** `vite.config.ts` (combined Vite + Vitest config, already configured)
**Quick run:** `npx vitest run`
**Full suite:** `npx vitest run --reporter=verbose`

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| APROD-01 | `adminProductApi.list()` calls `GET /admin/products` with pagination params | unit | `npx vitest run src/api/admin/__tests__/adminProductApi.test.ts` |
| APROD-02 | `adminProductApi.create()` calls `POST /admin/products` with correct body | unit | same file |
| APROD-03 | `adminProductApi.update()` calls `PUT /admin/products/{id}` | unit | same file |
| APROD-04 | `adminProductApi.delete()` calls `DELETE /admin/products/{id}` | unit | same file |
| APROD-05 | `adminProductApi.uploadImage()` uses FormData and POST `/admin/products/{id}/images` | unit | same file |
| AORD-01 | `adminOrderApi.list()` passes filter params as query string | unit | `npx vitest run src/api/admin/__tests__/adminOrderApi.test.ts` |
| AORD-02 | `adminOrderApi.getById()` calls `GET /admin/orders/{id}` | unit | same file |
| AORD-03 | `adminOrderApi.updateStatus()` calls `PATCH /admin/orders/{id}/status`; `adminOrderApi.cancel()` calls `POST /admin/orders/{id}/cancel` | unit | same file |
| DASH-01 | `adminDashboardApi.getStats()` calls `GET /admin/dashboard` | unit | `npx vitest run src/api/admin/__tests__/adminDashboardApi.test.ts` |
| DASH-02 | Dashboard displays `cho_xac_nhan` count from response | unit (component) | manual — requires live data |
| DASH-03 | Product stock summary renders in-stock / out-of-stock counts | manual | requires resolution of Open Question 2 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

The following test files must be created before implementation (following the same pattern as `src/api/__tests__/productApi.test.ts`):

- [ ] `src/api/admin/__tests__/adminProductApi.test.ts` — covers APROD-01 through APROD-05
- [ ] `src/api/admin/__tests__/adminOrderApi.test.ts` — covers AORD-01 through AORD-03
- [ ] `src/api/admin/__tests__/adminDashboardApi.test.ts` — covers DASH-01
- [ ] `src/api/admin/__tests__/adminCategoryApi.test.ts` — covers category CRUD used in product form

---

## Sources

### Primary (HIGH confidence)
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\routes\api.php` — All admin route definitions verified directly
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Presentation\Http\Controllers\Admin\*` — All controller method signatures, response shapes
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Presentation\Http\Resources\*` — All resource response field names and types
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Presentation\Http\Requests\*` — All request validation rules
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Domain\Order\Enums\OrderStatus.php` — State machine transitions verified
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Domain\Order\Enums\PaymentStatus.php` — Payment status values verified
- `d:\BANCHIMBOCAU\ban-chim-bo-cau\app\Domain\Order\Enums\DeliveryMethod.php` — Delivery method values verified
- `d:\BANCHIMBOCAU\ban-chim-bo-cau-client\src\api\axiosInstance.ts` — Existing interceptor behavior confirmed
- `d:\BANCHIMBOCAU\ban-chim-bo-cau-client\src\router\index.tsx` — Existing route stubs confirmed
- `d:\BANCHIMBOCAU\ban-chim-bo-cau-client\src\layouts\AdminLayout.tsx` — Existing admin shell confirmed
- `d:\BANCHIMBOCAU\ban-chim-bo-cau-client\src\types\api.ts` — Existing types to extend
- Phase 2 VERIFICATION.md — All Phase 2 patterns confirmed working

### Secondary (MEDIUM confidence)
- Ant Design 5 documentation patterns (Table, Form, Modal, Upload, Drawer) — from training knowledge; stable API since 5.0

### Tertiary (LOW confidence)
- None — all findings are verified from source code

---

## Metadata

**Confidence breakdown:**
- Backend API contracts: HIGH — read directly from backend source files
- Frontend infrastructure reuse: HIGH — verified from Phase 1 & 2 artifacts
- AntD component patterns: MEDIUM — stable API, from training knowledge (Aug 2025)
- Dashboard data gaps: HIGH — confirmed missing fields from controller response shape

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (stable stack; backend source is authoritative)
