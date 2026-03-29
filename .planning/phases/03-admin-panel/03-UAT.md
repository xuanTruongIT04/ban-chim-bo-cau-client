---
status: complete
phase: 03-admin-panel
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md]
started: 2026-03-29T06:00:00Z
updated: 2026-03-29T06:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Dashboard - Stat Cards
expected: Đăng nhập admin, vào `/admin/dashboard`. Hiện 5 stat cards đơn hàng theo trạng thái + product stock split "Đang bán" / "Hết hàng".
result: pass

### 2. Bảng sản phẩm
expected: Vào `/admin/products`. Table hiện với cột ảnh, tên, giá VND, tồn kho, trạng thái (tag xanh/đỏ), nút action. Pagination hoạt động.
result: pass

### 3. Thêm sản phẩm mới
expected: Click "Thêm sản phẩm". Modal mở với form. Submit → sản phẩm mới hiện trong table.
result: pass

### 4. Sửa sản phẩm
expected: Click Edit. Modal mở với data fill sẵn. Sửa field, submit → thay đổi phản ánh.
result: pass

### 5. Xóa sản phẩm
expected: Click Delete → dialog xác nhận. Confirm → sản phẩm biến mất.
result: pass

### 6. Upload ảnh sản phẩm
expected: Click nút ảnh → modal mở. Upload JPEG/PNG → ảnh hiện. Có "Set primary" và "Xóa".
result: pass

### 7. Điều chỉnh tồn kho
expected: Click stock adjust → modal mở. Nhập số lượng, loại, ghi chú. Submit → tồn kho cập nhật.
result: pass

### 8. Bảng đơn hàng
expected: Vào `/admin/orders`. Table hiện với cột ID, tên khách, SĐT, tổng VND, trạng thái tag màu, ngày tạo, "Chi tiết". Pagination hoạt động.
result: pass

### 9. Lọc đơn hàng
expected: Lọc theo trạng thái, search tên/SĐT, lọc khoảng ngày → table cập nhật.
result: pass

### 10. Chi tiết đơn hàng
expected: Click "Chi tiết" → drawer mở. Hiện thông tin khách, bảng items, tổng tiền.
result: pass

### 11. Chuyển trạng thái đơn hàng
expected: Nút trạng thái theo state machine. Click → trạng thái đổi. Terminal → không hiện nút.
result: pass

### 12. Hủy đơn hàng
expected: Click "Hủy đơn" → dialog xác nhận. Confirm → trạng thái "Hủy".
result: pass

## Summary

total: 12
passed: 12
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
