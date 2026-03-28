# Phase 1: Foundation + Authentication - Discussion Log

**Date:** 2026-03-28
**Phase:** 1 — Foundation + Authentication

---

## Area 1: Laravel Auth Contract

**Q:** Backend Laravel sử dụng package auth nào?
**Options:** Sanctum API tokens / Sanctum SPA mode / Tymon JWT / Chưa biết
**Selected:** Laravel Sanctum (API tokens)

**Q:** Response của POST /api/auth/login trả về gì?
**Options:** { token, user } / { access_token, token_type } / Chưa biết
**Selected:** `{ access_token: string, token_type: 'Bearer' }`

**Q:** Token có expiry không?
**Options:** Không expiry / Có expiry — re-login / Chưa biết
**Selected:** Có expiry — re-login khi 401

**Q:** User object có field role?
**Options:** `role: 'admin' | 'customer'` / `roles: string[]` / Cần gọi /api/me
**Selected:** `role: 'admin' | 'customer'`

---

## Area 2: Token Storage Strategy

**Q:** Lưu access token ở đâu?
**Options:** localStorage / Zustand memory only / sessionStorage
**Selected:** localStorage

**Q:** Lưu user object không?
**Options:** Có, lưu localStorage / Chỉ lưu token, gọi /api/me khi app khởi động
**Selected:** Chỉ lưu token, gọi /api/me khi app khởi động

---

## Area 3: Login Page UX

**Q:** Một trang login chung hay tách biệt?
**Options:** Một /login chung / Tách biệt /login và /admin/login
**User response (freeform):** "Customer không cần login và admin thì có hẳn trang login riêng."

→ **Key insight:** Auth là admin-only. Customer là guest hoàn toàn.

**Q:** Customer đăng nhập ở đâu để xem lịch sử đơn hàng?
**Options:** Nút Login trên navbar / Khi vào trang lịch sử → redirect login
**User response (freeform):** "Họ sẽ nhập số điện thoại khi đặt đơn hàng và khi xem lịch sử đơn hàng chỉ nhập số điện thoại"

→ **Key insight:** Order lookup = phone number, không cần account.

**Q:** Xác nhận customer không có tài khoản?
**Options:** Đúng — phone-based lookup / Vẫn cần tài khoản
**Selected:** Đúng — phone-based lookup, không cần tài khoản

**Q:** Design /admin/login?
**Options:** Centered card / Full-screen split / Claude tự quyết
**Selected:** Centered card trên nền xám

---

## Area 4: Route Architecture

**Q:** URL structure cho admin panel?
**Options:** /admin/* / /dashboard/* hoặc /manage/*
**Selected:** /admin/*

**Q:** Redirect khi unauthorized?
**Options:** /admin/login / /admin/login?redirect={url}
**Selected:** /admin/login

**Q:** Admin layout?
**Options:** Sidebar + top header / Chỉ top nav / Claude tự quyết
**Selected:** Sidebar + top header

**Q:** Customer layout?
**Options:** Top navbar (logo + danh mục + cart) / Minimal header / Claude tự quyết
**Selected:** Top navbar với logo + danh mục + giỏ hàng icon

---

## Scope Changes Identified

| Change | Impact |
|--------|--------|
| AUTH-04 (customer registration) → Out of Scope | Customers không có account |
| ACCOUNT-01/02 order history → phone lookup (no auth) | Simplifies Phase 4 significantly |
| ProtectedRoute chỉ cần cho /admin/* | Customer routes tất cả public |

---

*Generated: 2026-03-28*
