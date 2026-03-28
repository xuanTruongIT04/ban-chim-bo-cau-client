# Requirements: Bán Chim Bồ Câu — Frontend Client

**Defined:** 2026-03-28
**Core Value:** Khách hàng có thể duyệt, chọn và đặt mua chim bồ câu dễ dàng (kể cả không cần đăng nhập); admin có thể quản lý toàn bộ hệ thống từ một giao diện.

## v1 Requirements

### Foundation (Technical)

- [x] **FOUND-01**: Project được scaffold với Vite 6 + React 18 + TypeScript + ESLint + Prettier chuẩn production
- [x] **FOUND-02**: Cấu trúc thư mục clean architecture: `src/api/`, `src/stores/`, `src/hooks/`, `src/components/`, `src/layouts/`, `src/pages/`
- [x] **FOUND-03**: Cấu hình đa môi trường hoạt động: `.env.development`, `.env.staging`, `.env.production` với `VITE_API_BASE_URL`
- [ ] **FOUND-04**: Axios instance tập trung với interceptor tự động inject JWT Bearer token vào mọi request
- [ ] **FOUND-05**: Axios response interceptor xử lý lỗi global: 401 → redirect login, 422 → surface validation errors, 5xx → toast error
- [ ] **FOUND-06**: React Router v6 với `ProtectedRoute` component xử lý cả authentication check và role check (admin vs. customer)
- [ ] **FOUND-07**: Auth store (Zustand) với `persist` middleware — session không mất khi refresh trang
- [ ] **FOUND-08**: Cart store (Zustand) với `persist` middleware — giỏ hàng không mất khi refresh trang
- [ ] **FOUND-09**: TanStack Query (`QueryClientProvider`) setup — quản lý server state, loading, error, caching
- [ ] **FOUND-10**: Ant Design 5 (`ConfigProvider`) setup với theme cơ bản

### Authentication

- [ ] **AUTH-01**: Người dùng có thể đăng nhập bằng email/password (dùng chung cho admin và customer)
- [ ] **AUTH-02**: Người dùng có thể đăng xuất — token bị xóa, redirect về trang chủ
- [ ] **AUTH-03**: Session đăng nhập tồn tại qua browser refresh (không cần đăng nhập lại)
- [ ] **AUTH-04**: Khách hàng có thể tạo tài khoản (tự đăng ký với email/password)
- [ ] **AUTH-05**: Khách vãng lai (guest) có thể duyệt sản phẩm và đặt hàng mà không cần đăng nhập

### Customer — Product Browsing

- [ ] **PROD-01**: Khách có thể xem danh sách sản phẩm với phân trang
- [ ] **PROD-02**: Khách có thể filter sản phẩm theo danh mục/loại chim
- [ ] **PROD-03**: Khách có thể tìm kiếm sản phẩm theo tên
- [ ] **PROD-04**: Khách có thể xem trang chi tiết sản phẩm (tên, mô tả, giá, ảnh)
- [ ] **PROD-05**: Trang chi tiết sản phẩm hiển thị số lượng tồn kho ("Còn N con")
- [ ] **PROD-06**: Sản phẩm hết hàng hiển thị rõ trạng thái và không thể thêm vào giỏ

### Customer — Cart & Checkout

- [ ] **CART-01**: Khách có thể thêm sản phẩm vào giỏ hàng từ trang danh sách hoặc chi tiết
- [ ] **CART-02**: Khách có thể cập nhật số lượng sản phẩm trong giỏ hàng
- [ ] **CART-03**: Khách có thể xóa sản phẩm khỏi giỏ hàng
- [ ] **CART-04**: Giỏ hàng hiển thị tổng tiền cập nhật real-time
- [ ] **CART-05**: Giỏ hàng tồn tại qua browser refresh (localStorage persistence)
- [ ] **CHECKOUT-01**: Khách có thể điền form đặt hàng: tên, số điện thoại, địa chỉ giao hàng, ghi chú
- [ ] **CHECKOUT-02**: Khách thấy trang xác nhận đơn hàng thành công sau khi đặt (mã đơn, tóm tắt)
- [ ] **CHECKOUT-03**: Phương thức thanh toán mặc định là COD (thanh toán khi nhận hàng)

### Customer — Account

- [ ] **ACCOUNT-01**: Khách hàng đã đăng nhập có thể xem danh sách đơn hàng của mình
- [ ] **ACCOUNT-02**: Khách hàng có thể xem chi tiết từng đơn hàng (sản phẩm, trạng thái, địa chỉ)

### Admin — Product Management

- [ ] **APROD-01**: Admin có thể xem danh sách tất cả sản phẩm với phân trang
- [ ] **APROD-02**: Admin có thể thêm sản phẩm mới (tên, mô tả, giá, số lượng, danh mục, ảnh)
- [ ] **APROD-03**: Admin có thể chỉnh sửa thông tin sản phẩm
- [ ] **APROD-04**: Admin có thể xóa sản phẩm (có confirmation dialog)
- [ ] **APROD-05**: Admin có thể upload ảnh sản phẩm

### Admin — Order Management

- [ ] **AORD-01**: Admin có thể xem danh sách tất cả đơn hàng với bộ lọc theo trạng thái
- [ ] **AORD-02**: Admin có thể xem chi tiết đơn hàng (sản phẩm, khách hàng, địa chỉ, tổng tiền)
- [ ] **AORD-03**: Admin có thể cập nhật trạng thái đơn hàng (pending → confirmed → shipping → delivered / cancelled)

### Admin — Dashboard

- [ ] **DASH-01**: Admin thấy tổng số đơn hàng mới (hôm nay / tuần này)
- [ ] **DASH-02**: Admin thấy tổng doanh thu cơ bản
- [ ] **DASH-03**: Admin thấy số sản phẩm đang bán / hết hàng

### UX & Quality

- [ ] **UX-01**: Tất cả API calls có loading state rõ ràng (spinner / skeleton)
- [ ] **UX-02**: Tất cả lỗi API được hiển thị thông báo rõ ràng cho người dùng
- [ ] **UX-03**: Tất cả form có validation (client-side) với thông báo lỗi cụ thể
- [ ] **UX-04**: UI responsive, sử dụng được tốt trên mobile (360px+) và desktop

## v2 Requirements

### Customer — Enhanced

- **CUST-V2-01**: Nút liên hệ Zalo/WhatsApp trên trang chi tiết sản phẩm
- **CUST-V2-02**: Khách có thể đánh giá/nhận xét sản phẩm sau khi mua
- **CUST-V2-03**: Sản phẩm liên quan / gợi ý trên trang chi tiết

### Notifications

- **NOTF-V2-01**: Khách nhận email xác nhận đơn hàng (trigger từ backend)
- **NOTF-V2-02**: Admin nhận thông báo in-app khi có đơn hàng mới

### Admin — Advanced

- **ADASH-V2-01**: Chart doanh thu theo ngày/tháng (bar chart)
- **ADASH-V2-02**: Danh sách sản phẩm bán chạy nhất
- **AORD-V2-01**: Admin có thể export danh sách đơn hàng ra Excel/CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| SSR / Next.js | Không cần SEO cho v1; Vite SPA đủ dùng |
| OAuth / social login | JWT từ Laravel đủ; giảm phụ thuộc bên ngoài |
| Payment gateway (VNPay, MoMo) | COD chiếm đa số; tích hợp payment = 2-3x effort v1 |
| Real-time notifications (WebSocket) | Không critical cho v1; defer v2 |
| Mobile app (React Native) | Web-first; mobile web responsive đủ dùng |
| Đa ngôn ngữ (i18n) | Chỉ tiếng Việt cho v1 |
| Product variants / SKU | Chim bồ câu bán theo con/cặp; separate products là đúng |
| Multi-role admin (manager/staff) | Một role admin với full access là đủ cho v1 |
| Wishlist / Saved items | Defer v2 |
| Customer profile edit | Defer v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Done (01-01) |
| FOUND-02 | Phase 1 | Done (01-01) |
| FOUND-03 | Phase 1 | Done (01-01) |
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
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| ACCOUNT-01 | Phase 4 | Pending |
| ACCOUNT-02 | Phase 4 | Pending |
| UX-01 | Phase 4 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 46 total (enumerated; original draft stated 47 — count verified against requirement IDs)
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation — traceability updated with confirmed phase assignments*
