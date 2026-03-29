---
status: complete
phase: 04-account-polish
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-29T08:00:00Z
updated: 2026-03-29T08:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Lịch sử đơn hàng — hiển thị sau checkout
expected: Thêm sản phẩm → checkout → đặt hàng → vào `/orders`. Đơn hàng hiện. Expand → xem items, trạng thái, địa chỉ. Header có link "Đơn hàng".
result: pass

### 2. Lịch sử đơn hàng — persist sau refresh
expected: Refresh trang `/orders` → đơn hàng vẫn còn (localStorage). Có nút "Xóa lịch sử" hoạt động.
result: pass

### 3. Dashboard Revenue Card (DASH-02)
expected: Login admin → `/admin/dashboard`. Card "Doanh thu" hiện với giá trị VND. Loading spinner khi đang fetch.
result: pass

### 4. Loading states — Customer pages
expected: Throttle network. Truy cập các trang customer. Mỗi trang hiện spinner/skeleton khi đang load.
result: pass

### 5. Loading states — Admin pages
expected: Throttle network. Truy cập các trang admin. Mỗi trang hiện loading indicator.
result: pass

### 6. Error handling — tắt backend
expected: Tắt backend. Truy cập vài trang → hiện thông báo lỗi, không blank screen. Có nút "Thử lại".
result: pass

### 7. Form validation — inline errors
expected: Submit form trống → lỗi inline tiếng Việt trên checkout, login, product form.
result: pass

### 8. Mobile 360px — Customer pages
expected: Viewport 360x640. Không horizontal scroll. Text đọc được, nút bấm được. Cart items stack dọc.
result: pass

### 9. Mobile 360px — Admin pages
expected: Viewport 360px. Sidebar collapse. Tables scroll ngang. Dashboard cards stack dọc.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
