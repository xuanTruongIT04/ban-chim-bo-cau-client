---
phase: 01-foundation-authentication
plan: 02
subsystem: auth
tags: [zustand, axios, jwt, antd, react-router, interceptors, vitest]

# Dependency graph
requires:
  - phase: 01-01
    provides: src/types/api.ts (UserProfile, LoginRequest, LoginResponse, ApiError), src/config/env.ts

provides:
  - Axios instance with Bearer JWT request interceptor and 401/422/5xx response handling
  - Auth Zustand store with selective persistence (token only to localStorage)
  - Cart Zustand store with full localStorage persistence (stub for Phase 2)
  - Navigation service module for use inside Axios interceptor without React hook constraints
  - Ant Design 5 theme configuration matching UI-SPEC.md token overrides
  - Unit tests: 9 authStore tests + 10 axiosInstance tests (19 tests total)

affects: [all API calls, protected routes, admin layout, login page, Phase 2 cart]

# Tech tracking
tech-stack:
  added: [zustand/middleware persist, axios interceptors, antd ThemeConfig]
  patterns: [module-level navigator singleton, partialize for selective store persistence, isRefreshing dedup flag for concurrent 401s]

key-files:
  created:
    - src/api/axiosInstance.ts
    - src/api/__tests__/axiosInstance.test.ts
    - src/stores/authStore.ts
    - src/stores/__tests__/authStore.test.ts
    - src/stores/cartStore.ts
    - src/config/antd-theme.ts
    - src/lib/navigationService.ts
  modified: []

key-decisions:
  - "isRefreshing module-level flag prevents concurrent 401s from triggering multiple redirect/clearAuth cycles (D-27)"
  - "partialize: (state) => ({ token: state.token }) — only token persists to localStorage, user and isInitializing always rehydrate fresh (D-31)"
  - "422 responses not globally intercepted — pass through to call-site handlers per FOUND-05 contract"
  - "_resetIsRefreshing exported for test isolation of module-level flag state"
  - "Vietnamese diacritics used in error messages per UI-SPEC.md copywriting contract"

patterns-established:
  - "Pattern: navigateTo() via module singleton — safe to call from Axios interceptor without useNavigate hook"
  - "Pattern: useAuthStore.getState() (not hook) for reading state outside React components"
  - "Pattern: Zustand persist with partialize to persist only token, not full auth state"

requirements-completed: [FOUND-04, FOUND-05, FOUND-07, FOUND-08, FOUND-09, FOUND-10]

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 01 Plan 02: Core Infrastructure Modules Summary

**Axios instance with Bearer JWT interceptors, Zustand auth/cart stores with localStorage persistence, navigation service singleton, and AntD theme config — all wired per UI-SPEC.md contract and tested with 19 passing Vitest tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-28T10:51:00Z
- **Completed:** 2026-03-28T10:56:19Z
- **Tasks:** 2
- **Files modified:** 7 created

## Accomplishments

- Axios instance with request interceptor (Bearer token injection) and response interceptor (401 clears auth + redirects, 422 passes through to call-site, 5xx shows Vietnamese error toast)
- Auth Zustand store with `persist` middleware — only `token` field serialized to `localStorage` key `auth_token`; `user` and `isInitializing` always rehydrate fresh
- Cart Zustand store stub with full `persist` to `cart_storage` localStorage key — ready for Phase 2 wiring
- Navigation service singleton (`setNavigator`/`navigateTo`) for safe use inside Axios interceptor
- AntD theme config with `headerBg`/`siderBg: '#ffffff'`, `borderRadius: 8`, matching UI-SPEC.md exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Navigation service, auth/cart stores, AntD theme** - `a12dece` (feat)
2. **Task 2: Axios instance with JWT interceptors** - `e053c13` (feat)

**Plan metadata:** (pending — final commit)

_Note: Both tasks used TDD (RED → GREEN) with Vitest_

## Files Created/Modified

- `src/lib/navigationService.ts` - Module-level navigate singleton; `setNavigator(nav)` + `navigateTo(path)` with `window.location.href` fallback
- `src/stores/authStore.ts` - Zustand store with `setAuth`, `clearAuth`, `setUser`, `setInitializing`; persist `name: 'auth_token'` with `partialize: token only`
- `src/stores/cartStore.ts` - Zustand cart stub with add/remove/update/clear/totalAmount; persist `name: 'cart_storage'`
- `src/config/antd-theme.ts` - AntD 5 ThemeConfig with `headerBg`, `siderBg`, `itemBg` white and `borderRadius: 8`
- `src/api/axiosInstance.ts` - Axios instance with Bearer request interceptor, 401/5xx response interceptor, `isRefreshing` dedup flag, `_resetIsRefreshing` test export
- `src/stores/__tests__/authStore.test.ts` - 9 tests covering initial state, setAuth, clearAuth, setUser, setInitializing, partialize config
- `src/api/__tests__/axiosInstance.test.ts` - 10 tests covering baseURL, request interceptor (token present/absent), 401 with dedup, 5xx toast, 422 passthrough

## Decisions Made

- **`_resetIsRefreshing` export** — `isRefreshing` is module-level state that persists across tests within the same Vitest test file. Exporting `_resetIsRefreshing()` for use in `beforeEach` is the cleanest solution without resorting to `vi.resetModules()` + dynamic imports (which complicates mock setup significantly).
- **Vietnamese diacritics in error strings** — Used `'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'` and `'Lỗi máy chủ. Vui lòng thử lại sau.'` exactly matching the UI-SPEC.md copywriting contract.
- **422 not globally handled** — Aligns with FOUND-05: the login page (and future form pages) need to read `error.response.data.errors` for field-level validation display. Global interception would swallow this information.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing devDependencies**
- **Found during:** Task 1 (TDD RED verification)
- **Issue:** `node_modules` was missing in the worktree; `npm install` (without `--include=dev`) installed only 105 packages, omitting vitest, @testing-library, jsdom, and other devDeps
- **Fix:** Ran `npm install --include=dev` to install full dependency tree including devDependencies
- **Files modified:** node_modules (not committed; package-lock.json was already correct)
- **Verification:** `vitest run` successfully executed tests after install
- **Committed in:** Not a code change — environment setup

**2. [Rule 1 - Bug] Added `_resetIsRefreshing` export for test isolation**
- **Found during:** Task 2 (GREEN phase — 2 tests failing due to module-level state bleed)
- **Issue:** `isRefreshing` module-level flag persisted across tests; second and third 401 tests saw `isRefreshing = true` from the first test's `setTimeout(reset, 1000)` which hadn't fired yet
- **Fix:** Exported `_resetIsRefreshing()` function; called it in `beforeEach` in the test file
- **Files modified:** `src/api/axiosInstance.ts`, `src/api/__tests__/axiosInstance.test.ts`
- **Verification:** All 10 axiosInstance tests pass
- **Committed in:** `e053c13`

---

**Total deviations:** 2 auto-fixed (1 blocking environment, 1 test isolation bug)
**Impact on plan:** Both fixes necessary for correctness and test reliability. No scope creep.

## Issues Encountered

- Worktree did not have devDependencies installed. `npm install` without flags only installed production dependencies. Running `npm install --include=dev` resolved it.

## Known Stubs

- `src/stores/cartStore.ts` — Cart store is a functional stub for Phase 1. All cart operations (`addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalAmount`) are implemented but no UI is wired to the store yet. The store is ready for Phase 2 product pages to connect to it.

## Next Phase Readiness

- All infrastructure modules ready for Plan 03 (React Router setup) and Plan 04 (auth pages)
- `axiosInstance` is ready to be used in all API service modules starting Plan 05
- `useAuthStore` is ready for `AdminRoute` protected route component
- `useCartStore` is wired and ready for Phase 2 product/cart pages
- AntD theme is ready to be applied in `main.tsx` via `<ConfigProvider theme={antdTheme}>`

---
*Phase: 01-foundation-authentication*
*Completed: 2026-03-28*

## Self-Check: PASSED

- FOUND: src/api/axiosInstance.ts
- FOUND: src/stores/authStore.ts
- FOUND: src/stores/cartStore.ts
- FOUND: src/lib/navigationService.ts
- FOUND: src/config/antd-theme.ts
- FOUND: src/stores/__tests__/authStore.test.ts
- FOUND: src/api/__tests__/axiosInstance.test.ts
- FOUND: .planning/phases/01-foundation-authentication/01-02-SUMMARY.md
- FOUND commit: a12dece
- FOUND commit: e053c13
