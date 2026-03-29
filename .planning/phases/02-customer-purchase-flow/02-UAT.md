---
status: complete
phase: 02-customer-purchase-flow
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md]
started: 2026-03-29T04:00:00Z
updated: 2026-03-29T05:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Tắt dev server. Chạy `npm run dev` từ đầu. App load không lỗi, trang chủ hiện được. Console không có lỗi đỏ.
result: pass

### 2. Danh sách sản phẩm với phân trang
expected: Truy cập `/`. Hiện product grid với các card sản phẩm. Có pagination control ở dưới. Loading skeleton hiện khi đang fetch.
result: pass

### 3. Lọc theo danh mục và tìm kiếm
expected: Category filter dropdown hiện danh sách danh mục. Chọn 1 danh mục → sản phẩm lọc theo. Gõ tên sản phẩm vào search → lọc client-side trên trang hiện tại.
result: pass

### 4. Xem chi tiết sản phẩm
expected: Click vào 1 sản phẩm → trang chi tiết hiện ảnh, giá VND, tình trạng tồn kho, bộ chọn số lượng, và nút "Thêm vào giỏ hàng".
result: pass

### 5. Thêm sản phẩm vào giỏ hàng
expected: Trên trang chi tiết, chọn số lượng 2, click "Thêm vào giỏ hàng". Toast thành công hiện. Badge giỏ hàng ở header tăng lên.
result: pass

### 6. Xem và quản lý giỏ hàng
expected: Vào `/cart`. Hiện danh sách items với tên, giá VND, số lượng, thành tiền. Đổi số lượng → tổng cập nhật sau ~500ms. Click xóa → item biến mất. Order summary hiện tổng tiền.
result: pass

### 7. Giỏ hàng trống
expected: Xóa hết items trong giỏ. Hiện trạng thái "Giỏ hàng trống" với nút "Tiếp tục mua sắm" dẫn về trang chủ.
result: pass

### 8. Checkout form validation
expected: Vào `/checkout`. Submit form trống → hiện lỗi validation tiếng Việt. Nhập SĐT sai format → lỗi inline. Phương thức thanh toán hiện COD (read-only).
result: pass

### 9. Đặt hàng thành công
expected: Điền đầy đủ: Tên, SĐT, Địa chỉ. Click "Đặt hàng ngay". Chuyển sang trang xác nhận với mã đơn hàng, thông tin khách hàng, danh sách sản phẩm, tổng tiền.
result: blocked
blocked_by: server
reason: "Backend trả 500 SERVER_ERROR — Idempotency middleware class not found. Package infinitypaul/laravel-idempotency chưa cài ở backend."

### 10. Giỏ hàng rỗng sau đặt hàng
expected: Sau khi đặt hàng thành công, quay lại `/cart` → hiện "Giỏ hàng trống". Badge header về 0.
result: skipped
reason: Phụ thuộc test 9 (checkout blocked by backend)

### 11. Định dạng tiền VND
expected: Tất cả giá trên trang sản phẩm, giỏ hàng, checkout đều hiện đúng format VND với dấu phân cách hàng nghìn.
result: pass

## Summary

total: 11
passed: 9
issues: 0
pending: 0
skipped: 1
blocked: 1

## Gaps

[none — blocked items are backend dependencies, not FE code issues]
