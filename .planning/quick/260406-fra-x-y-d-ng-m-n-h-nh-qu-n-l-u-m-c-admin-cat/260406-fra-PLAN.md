---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/api.ts
  - src/api/admin/adminCategoryApi.ts
  - src/hooks/admin/useAdminCategories.ts
  - src/components/admin/CategoryFormModal.tsx
  - src/pages/admin/CategoriesPage.tsx
  - src/router/index.tsx
  - src/layouts/AdminLayout.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "Admin can see list of categories as cards on /admin/categories"
    - "Admin can create a new category via modal form"
    - "Admin can edit an existing category via modal form"
    - "Admin can delete a category with confirmation dialog"
    - "Categories page is accessible from admin sidebar menu"
  artifacts:
    - path: "src/types/api.ts"
      provides: "AdminCategoryResource and CreateCategoryPayload types"
      contains: "AdminCategoryResource"
    - path: "src/api/admin/adminCategoryApi.ts"
      provides: "CRUD API methods for admin categories"
      exports: ["adminCategoryApi"]
    - path: "src/hooks/admin/useAdminCategories.ts"
      provides: "TanStack Query hooks for category CRUD"
      exports: ["useAdminCategories", "useCreateCategory", "useUpdateCategory", "useDeleteCategory"]
    - path: "src/components/admin/CategoryFormModal.tsx"
      provides: "Modal form for creating/editing categories"
      exports: ["default"]
    - path: "src/pages/admin/CategoriesPage.tsx"
      provides: "Card-based category listing page"
      exports: ["default"]
  key_links:
    - from: "src/pages/admin/CategoriesPage.tsx"
      to: "src/hooks/admin/useAdminCategories.ts"
      via: "hook imports"
      pattern: "useAdminCategories|useDeleteCategory"
    - from: "src/hooks/admin/useAdminCategories.ts"
      to: "src/api/admin/adminCategoryApi.ts"
      via: "API calls in queryFn/mutationFn"
      pattern: "adminCategoryApi\\."
    - from: "src/router/index.tsx"
      to: "src/pages/admin/CategoriesPage.tsx"
      via: "route registration"
      pattern: "/admin/categories"
    - from: "src/layouts/AdminLayout.tsx"
      to: "/admin/categories"
      via: "menu item with AppstoreOutlined icon"
      pattern: "AppstoreOutlined"
---

<objective>
Build the admin "Categories Management" (Quan ly dau muc) screen with full CRUD operations, using the same Card-based UI/UX pattern as ProductsPage.

Purpose: Allow admins to create, view, edit, and delete product categories from the admin panel, completing the category management capability.
Output: Fully functional CategoriesPage accessible at /admin/categories with sidebar navigation.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/types/api.ts
@src/api/admin/adminCategoryApi.ts
@src/api/admin/adminProductApi.ts
@src/hooks/admin/useAdminProducts.ts
@src/pages/admin/ProductsPage.tsx
@src/components/admin/ProductFormModal.tsx
@src/router/index.tsx
@src/layouts/AdminLayout.tsx

<interfaces>
<!-- Existing patterns the executor must follow exactly -->

From src/api/axiosInstance.ts — base HTTP client:
```typescript
import { axiosInstance } from '../axiosInstance';
```

From src/types/api.ts — existing CategoryResource (used by product form):
```typescript
export interface CategoryResource {
  id: number;
  name: string;
  children?: CategoryResource[];
}
```

From src/api/admin/adminProductApi.ts — API method pattern:
```typescript
export const adminProductApi = {
  list: async (params): Promise<...> => {
    const response = await axiosInstance.get('/admin/products', { params });
    return response.data;
  },
  create: async (payload): Promise<...> => {
    const response = await axiosInstance.post('/admin/products', payload);
    return response.data.data;
  },
  update: async (id, payload): Promise<...> => {
    const response = await axiosInstance.put(`/admin/products/${id}`, payload);
    return response.data.data;
  },
  delete: async (id): Promise<void> => {
    await axiosInstance.delete(`/admin/products/${id}`);
  },
};
```

From src/hooks/admin/useAdminProducts.ts — TanStack Query hook pattern:
```typescript
export const ADMIN_PRODUCTS_KEY = 'admin-products';
export function useAdminProducts(params) { return useQuery({...}); }
export function useCreateProduct() { return useMutation({...onSuccess: invalidate + message.success}); }
export function useDeleteProduct() { return useMutation({...onSuccess: invalidate + message.success}); }
```

From src/layouts/AdminLayout.tsx — menu items array:
```typescript
const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tong quan' },
  { key: '/admin/products', icon: <ShoppingOutlined />, label: 'San pham' },
  { key: '/admin/orders', icon: <OrderedListOutlined />, label: 'Don hang' },
];
```

From src/router/index.tsx — admin route pattern:
```typescript
{ path: '/admin/products', element: <ProductsPage /> },
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add types, API methods, and TanStack Query hooks for category CRUD</name>
  <files>src/types/api.ts, src/api/admin/adminCategoryApi.ts, src/hooks/admin/useAdminCategories.ts</files>
  <action>
**1. Add types to `src/types/api.ts`** — append after the existing types at the end of the file:

```typescript
// --- Admin Category types ---
export interface AdminCategoryResource {
  id: number;
  name: string;
  slug?: string;
  parent_id: number | null;
  description?: string | null;
  sort_order?: number;
  is_active: boolean;
  children?: AdminCategoryResource[];
  products_count?: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parent_id?: number | null;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
}
```

**2. Expand `src/api/admin/adminCategoryApi.ts`** — replace entire file. Keep the existing `list` method but update its return type to `AdminCategoryResource[]`. Add `create`, `update`, and `delete` methods following the exact same pattern as `adminProductApi.ts`:

- `list()` — GET `/admin/categories`, returns `response.data.data ?? response.data` (keep existing logic)
- `create(payload: CreateCategoryPayload)` — POST `/admin/categories`, returns `response.data.data`
- `update(id: number, payload: Partial<CreateCategoryPayload>)` — PUT `/admin/categories/${id}`, returns `response.data.data`
- `delete(id: number)` — DELETE `/admin/categories/${id}`, returns void

Import `AdminCategoryResource` and `CreateCategoryPayload` from types instead of `CategoryResource`.

**3. Create `src/hooks/admin/useAdminCategories.ts`** — follow the exact pattern from `useAdminProducts.ts`:

- `ADMIN_CATEGORIES_KEY = 'admin-categories'` (constant for query key — note: this key is already used by ProductFormModal's inline query; using the same key means ProductFormModal's category dropdown will also benefit from cache invalidation)
- `useAdminCategories()` — `useQuery` with queryKey `[ADMIN_CATEGORIES_KEY]`, calls `adminCategoryApi.list()`, staleTime 2 minutes
- `useCreateCategory()` — `useMutation` calling `adminCategoryApi.create(payload)`, onSuccess: invalidate `[ADMIN_CATEGORIES_KEY]` + `message.success('Tao dau muc thanh cong')`, onError: `message.error('Khong the tao dau muc. Vui long thu lai.')`
- `useUpdateCategory()` — `useMutation` with `mutationFn: ({ id, payload })` calling `adminCategoryApi.update(id, payload)`, onSuccess: invalidate + `message.success('Cap nhat dau muc thanh cong')`, onError: `message.error('Khong the cap nhat dau muc. Vui long thu lai.')`
- `useDeleteCategory()` — `useMutation` calling `adminCategoryApi.delete(id)`, onSuccess: invalidate + `message.success('Xoa dau muc thanh cong')`, onError: `message.error('Khong the xoa dau muc. Vui long thu lai.')`

All Vietnamese text must use proper diacritics (e.g. "Tạo đầu mục thành công", "Không thể tạo đầu mục. Vui lòng thử lại.").
  </action>
  <verify>
    <automated>cd /Users/toney/projects/ban-chim-bo-cau-client && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>AdminCategoryResource and CreateCategoryPayload types exist in api.ts. adminCategoryApi has list/create/update/delete methods. useAdminCategories hook file exports useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory. TypeScript compiles without errors.</done>
</task>

<task type="auto">
  <name>Task 2: Create CategoryFormModal, CategoriesPage, register route and sidebar menu</name>
  <files>src/components/admin/CategoryFormModal.tsx, src/pages/admin/CategoriesPage.tsx, src/router/index.tsx, src/layouts/AdminLayout.tsx</files>
  <action>
**1. Create `src/components/admin/CategoryFormModal.tsx`** — Modal for create/edit category. Follow the exact same structure as `ProductFormModal.tsx`:

Props: `{ open: boolean; onClose: () => void; editingCategory: AdminCategoryResource | null; }`

- Use `Form.useForm()`, determine `isEdit = editingCategory !== null`
- Fetch category list for parent_id select using `useAdminCategories()` hook (from Task 1)
- Use `useCreateCategory()` and `useUpdateCategory()` hooks
- `useEffect` on `[open, editingCategory, form]`: if editing, `form.setFieldsValue({ name, parent_id, is_active })`, else `form.resetFields()` then `form.setFieldsValue({ is_active: true })`
- `handleSubmit`: validateFields, then create or update, then `onClose()`
- Form fields:
  - `name` (Input, required, rules: `[{ required: true, message: 'Vui long nhap ten dau muc' }]`)
  - `parent_id` (Select, optional, placeholder "Chon dau muc cha (tuy chon)", allowClear). Options: flatten categories from `useAdminCategories` data, but when editing, EXCLUDE the current category itself (filter out `editingCategory.id`) to prevent self-referencing. Use `{ value: cat.id, label: cat.name }` for each category.
  - `is_active` (Switch, valuePropName="checked", checkedChildren="Hoat dong", unCheckedChildren="An")
- Modal title: `isEdit ? 'Chinh sua dau muc' : 'Them dau muc moi'`
- okText: `isEdit ? 'Cap nhat' : 'Tao'`, cancelText: "Huy"
- `destroyOnClose` on Modal
- All text in Vietnamese with proper diacritics

**2. Create `src/pages/admin/CategoriesPage.tsx`** — Card-based layout mirroring ProductsPage exactly:

Structure:
- State: `editingCategory` (AdminCategoryResource | null), `modalOpen` (boolean)
- Use `useAdminCategories()` for data, `useDeleteCategory()` for delete mutation
- Header: flex row with Title level={2} "Quan ly dau muc" (color: #1b5e20) + Button "Them dau muc" with PlusOutlined icon (same size/style as ProductsPage: size="large", fontWeight 600, fontSize 16, height 48)
- Error state: Alert type="error" message="Khong tai duoc danh sach dau muc" (same pattern as ProductsPage)
- Loading: centered Spin size="large" with padding 60
- Empty: Empty component with "Chua co dau muc nao" + Button "Them dau muc dau tien"
- Category cards: each category rendered as a Card with borderRadius 12, border '1px solid #e0e0e0', body padding 16. Inside a Row with gutter [16, 16] align="middle":
  - Col xs={24} sm={16}: Category name (Text strong, fontSize 18, color '#1b5e20'), then a flex row showing: parent name as Tag color="blue" if parent_id exists (find parent name from categories list), products_count as "N san pham" text if available, is_active as Tag (color="green" "Hoat dong" or color="red" "An")
  - Col xs={24} sm={8}: Row of 2 action buttons: "Sua" (EditOutlined) and "Xoa" (DeleteOutlined, danger type="primary"). Each button: block, height 44, fontSize 15, fontWeight 500. Use Col xs={12} sm={12} for each button.
- Delete handler: `Modal.confirm` with title "Xac nhan xoa dau muc", content template literal with category name, okText "Xoa", okType "danger", cancelText "Huy", onOk calls `deleteCategory.mutateAsync(category.id)`
- NO pagination (per requirements)
- CategoryFormModal at bottom with open/onClose/editingCategory props

Extract the card into a separate `CategoryCard` function component within the same file (same pattern as `ProductCard` in ProductsPage.tsx).

All Vietnamese text must use proper diacritics throughout.

**3. Register route in `src/router/index.tsx`**:
- Import `CategoriesPage` from `'../pages/admin/CategoriesPage'` (direct import, not lazy — same as ProductsPage)
- Add route `{ path: '/admin/categories', element: <CategoriesPage /> }` inside the AdminLayout children array, after the `/admin/orders` route

**4. Add menu item in `src/layouts/AdminLayout.tsx`**:
- Import `AppstoreOutlined` from `@ant-design/icons`
- Add menu item to `menuItems` array AFTER "San pham" (products) and BEFORE "Don hang" (orders):
  ```
  {
    key: '/admin/categories',
    icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
    label: 'Dau muc',
  }
  ```
  Use proper Vietnamese diacritics: "Đầu mục"
  </action>
  <verify>
    <automated>cd /Users/toney/projects/ban-chim-bo-cau-client && npx tsc --noEmit 2>&1 | head -30 && npx vite build 2>&1 | tail -10</automated>
  </verify>
  <done>CategoriesPage renders category cards at /admin/categories. CategoryFormModal opens for add/edit. Delete confirmation works. Sidebar shows "Dau muc" menu item with AppstoreOutlined icon. Route registered. TypeScript compiles. Vite build succeeds.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` — zero TypeScript errors
2. `npx vite build` — production build succeeds
3. Navigate to /admin/categories — page loads with header and empty state (or categories if data exists)
4. Click "Them dau muc" — modal opens with name, parent_id, is_active fields
5. Sidebar shows "Dau muc" item between "San pham" and "Don hang"
</verification>

<success_criteria>
- Admin can navigate to /admin/categories from sidebar
- Categories display as cards with name, parent info, active status, and action buttons
- Add/Edit category modal works with proper form validation
- Delete category shows confirmation dialog and executes deletion
- All text is in Vietnamese with proper diacritics
- UI style matches ProductsPage (card borderRadius 12, title color #1b5e20, button sizing)
- Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/260406-fra-x-y-d-ng-m-n-h-nh-qu-n-l-u-m-c-admin-cat/260406-fra-SUMMARY.md`
</output>
