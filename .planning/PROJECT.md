# Bán Chim Bồ Câu — Frontend Client

## What This Is

Ứng dụng frontend React production-ready cho hệ thống bán chim bồ câu trực tuyến. Giao tiếp với backend Laravel qua RESTful API. Gồm hai phần: giao diện khách hàng (xem sản phẩm, giỏ hàng, đặt hàng) và giao diện quản trị nội bộ (quản lý sản phẩm, đơn hàng, dashboard).

## Core Value

Khách hàng có thể duyệt, chọn và đặt mua chim bồ câu dễ dàng; admin có thể quản lý toàn bộ hệ thống từ một giao diện duy nhất.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Foundation**
- [ ] Cấu trúc project Vite + React + TypeScript chuẩn production
- [ ] Clean architecture: services / hooks / components / pages / layouts tách biệt rõ ràng
- [ ] Cấu hình đa môi trường (dev, staging, production)
- [ ] Axios instance với interceptor xử lý JWT token và lỗi global
- [ ] Routing với React Router v6 (public + protected routes)

**Authentication**
- [ ] Trang đăng nhập (admin và khách hàng dùng chung endpoint)
- [ ] Đăng xuất + xóa token
- [ ] Persistent session (refresh page không mất đăng nhập)
- [ ] Phân quyền role-based: admin vs. customer

**Customer-facing**
- [ ] Danh sách sản phẩm (chim bồ câu) với filter/search cơ bản
- [ ] Trang chi tiết sản phẩm
- [ ] Giỏ hàng (thêm/xóa/cập nhật số lượng)
- [ ] Checkout đơn giản (form đặt hàng, xác nhận)

**Admin panel**
- [ ] Dashboard thống kê cơ bản (tổng sản phẩm, đơn hàng mới)
- [ ] Quản lý sản phẩm: danh sách, thêm, sửa, xóa
- [ ] Quản lý đơn hàng: danh sách, xem chi tiết, cập nhật trạng thái

**UX & Quality**
- [ ] Loading states và error handling nhất quán toàn app
- [ ] Responsive design (mobile-friendly)
- [ ] Form validation
- [ ] UI với Ant Design

### Out of Scope

- SSR / Next.js — không cần SEO cho v1
- OAuth / social login — JWT từ Laravel đủ cho v1
- Real-time notifications (WebSocket) — defer v2
- Payment gateway tích hợp — checkout đơn giản, thanh toán offline/COD
- Mobile app (React Native) — web-first
- Đa ngôn ngữ (i18n) — chỉ tiếng Việt cho v1

## Context

- Backend: Laravel (sibling folder), cung cấp RESTful API với xác thực JWT
- Frontend giao tiếp hoàn toàn qua API — không có server-side rendering
- Chưa có API docs chính thức; contract sẽ được define song song với development
- Stack: Vite + React 18 + TypeScript + Zustand + Ant Design + React Router v6 + Axios
- Project là greenfield — bắt đầu từ đầu

## Constraints

- **Tech Stack**: Vite (không phải Next.js) — không cần SSR/SEO
- **UI Library**: Ant Design — admin tables/forms sẵn có, tiết kiệm thời gian
- **State Management**: Zustand — nhẹ, ít boilerplate, phù hợp quy mô dự án
- **API**: Phải align với Laravel backend; chưa có docs → cần define contract khi build
- **Auth**: JWT token từ Laravel; cần refresh token strategy hoặc re-login on expiry
- **Dependencies**: Backend Laravel phải chạy trước khi frontend có thể test API thật

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite thay vì Next.js | Không cần SEO, đơn giản hơn, build nhanh hơn | — Pending |
| Zustand thay vì Redux Toolkit | Ít boilerplate, đủ cho quy mô dự án vừa | — Pending |
| Ant Design cho UI | Admin panel cần table/form/modal phức tạp — AntD sẵn có đầy đủ | — Pending |
| React Router v6 | Routing client-side phù hợp SPA không cần SSR | — Pending |
| Axios với interceptors | Centralized token injection và error handling | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
