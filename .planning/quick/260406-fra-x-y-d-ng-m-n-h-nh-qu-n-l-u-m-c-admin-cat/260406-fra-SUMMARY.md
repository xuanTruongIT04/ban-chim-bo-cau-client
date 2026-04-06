---
phase: quick
plan: 260406-fra
subsystem: admin-panel
tags: [admin, categories, CRUD, ant-design, tanstack-query]
dependency_graph:
  requires: []
  provides: [admin-categories-management]
  affects: [ProductFormModal, AdminLayout, router]
tech_stack:
  added: []
  patterns: [card-based-list, modal-form, tanstack-query-mutations, query-cache-invalidation]
key_files:
  created:
    - src/hooks/admin/useAdminCategories.ts
    - src/components/admin/CategoryFormModal.tsx
    - src/pages/admin/CategoriesPage.tsx
  modified:
    - src/types/api.ts
    - src/api/admin/adminCategoryApi.ts
    - src/router/index.tsx
    - src/layouts/AdminLayout.tsx
decisions:
  - adminCategoryApi.list() now calls /admin/categories (admin endpoint) instead of /categories (public endpoint) — provides admin-level category data with parent_id, is_active, products_count fields
  - ADMIN_CATEGORIES_KEY matches the key used in ProductFormModal useQuery — cache invalidation from category mutations auto-refreshes ProductFormModal's dropdown
  - CategoryFormModal filters out editing category from parent_id Select to prevent self-referencing
metrics:
  duration: 8
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 3
  files_modified: 4
---

# Quick Task 260406-fra: Admin Categories Management Screen — Summary

**One-liner:** Full CRUD admin categories screen with card UI, modal form, and sidebar navigation matching the ProductsPage pattern.

## What Was Built

Admin category management screen at `/admin/categories` with:
- Card-based listing showing category name, parent tag, product count, and active status
- Create/edit modal form with name, parent selector, and active status toggle
- Delete with Modal.confirm confirmation dialog
- TanStack Query hooks with cache invalidation and Vietnamese success/error messages
- Sidebar menu item "Đầu mục" with AppstoreOutlined icon between Sản phẩm and Đơn hàng

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add types, API methods, and TanStack Query hooks | 96041ed | src/types/api.ts, src/api/admin/adminCategoryApi.ts, src/hooks/admin/useAdminCategories.ts |
| 2 | Create CategoryFormModal, CategoriesPage, register route and sidebar menu | b315f39 | src/components/admin/CategoryFormModal.tsx, src/pages/admin/CategoriesPage.tsx, src/router/index.tsx, src/layouts/AdminLayout.tsx |

## Verification Results

- `npx tsc --noEmit` — zero TypeScript errors
- `npx vite build` — production build succeeds (3.42s, 3155 modules)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Deviation Notes

- `adminCategoryApi.list()` was updated to call `/admin/categories` instead of the public `/categories` endpoint. The original file used the public endpoint which would not return admin-specific fields (`parent_id`, `is_active`, `products_count`). This aligns with the plan's intent (admin CRUD) and matches the `adminProductApi` pattern.
- `ProductFormModal` inline `useQuery` key `'admin-categories'` already matches `ADMIN_CATEGORIES_KEY` from the new hook — cache invalidation from category mutations will refresh ProductFormModal's category dropdown automatically.

## Known Stubs

None — all category data flows from live API calls.

## Self-Check: PASSED
