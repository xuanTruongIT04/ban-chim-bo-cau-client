# Domain Pitfalls

**Domain:** React SPA e-commerce frontend + Laravel REST API
**Stack:** Vite + React 18 + TypeScript + Zustand + Ant Design + React Router v6 + Axios
**Researched:** 2026-03-28
**Confidence:** MEDIUM — based on training knowledge (external tools unavailable); core patterns are stable and well-established

---

## Critical Pitfalls

Mistakes that cause rewrites, security holes, or production outages.

---

### Pitfall 1: Axios Interceptor Token Refresh Race Condition

**What goes wrong:**
Multiple API calls fire simultaneously (e.g., dashboard loads 3 parallel requests). The first 401 triggers a token refresh. While the refresh is in-flight, the other 2 requests also get 401s and each independently trigger their own refresh calls. The result: 3 concurrent refresh attempts, 2 of which fail (the refresh token gets consumed or invalidated by the first use), and the user gets logged out unexpectedly.

**Why it happens:**
Naive interceptor implementation handles each 401 independently without coordinating with other in-flight refresh attempts.

**Consequences:**
- Random logouts in production, especially on pages that fire multiple API calls on mount
- Refresh token invalidation loops
- Extremely difficult to reproduce in dev (sequential requests don't trigger it)

**Prevention:**
Use a request queue pattern with a `isRefreshing` flag:

```typescript
// In axiosInstance.ts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

**Detection:**
- Open Network tab, trigger a page that fires 3+ simultaneous API calls, then expire the token manually — watch for multiple refresh calls
- "Logged out randomly" bug reports from users

**Phase:** Foundation / Authentication setup (Phase 1)

---

### Pitfall 2: JWT Stored in localStorage — XSS Attack Surface

**What goes wrong:**
Storing JWT access tokens in `localStorage` exposes them to any JavaScript executing on the page. A single XSS vulnerability (including via a compromised npm package) allows token theft and session hijacking without the user's knowledge. The attacker can make authenticated API calls indefinitely.

**Why it happens:**
`localStorage` is the simplest persistence mechanism and the one shown in most tutorials.

**Consequences:**
- Silent account takeover
- For an e-commerce app: stolen orders, address data, payment history exposure
- Admin panel tokens exposed = full data breach

**Prevention:**
- Store access token in memory (Zustand store, module-level variable) — lost on page refresh but secure from XSS
- Store refresh token in `httpOnly` cookie (requires Laravel backend cooperation)
- If `httpOnly` cookies are not available from the backend, use `sessionStorage` for access tokens as a compromise (still XSS-vulnerable but not persistent)
- Mitigate XSS with strict CSP headers at the Nginx/hosting level

**Detection:**
- If you can read the JWT from browser console with `localStorage.getItem('token')`, you're exposed

**Phase:** Authentication (Phase 1-2). Align with backend on `httpOnly` cookie strategy early — it affects Laravel API response design.

---

### Pitfall 3: CORS Misconfiguration Between Vite Dev Server and Laravel

**What goes wrong:**
Two distinct CORS failures occur that look identical to the developer:

1. **Dev-only CORS errors:** Laravel's `config/cors.php` doesn't include `http://localhost:5173` (Vite default port) in `allowed_origins`. Developer adds `*` globally and ships to staging without reverting.
2. **Credentials not sent:** `axios.defaults.withCredentials = true` is set on the frontend but Laravel's CORS config doesn't have `supports_credentials: true`. Cookie-based sessions silently fail.

**Why it happens:**
CORS is configured in two places (Laravel backend, Axios instance) and errors are cryptic in the browser.

**Consequences:**
- `*` wildcard in production = CORS security bypass
- Auth cookies never sent = persistent "not authenticated" bugs in staging
- Different behavior between dev/staging/prod that's hard to trace

**Prevention:**
- Laravel `cors.php`: set `allowed_origins` to an array from env vars — `[env('FRONTEND_URL', 'http://localhost:5173')]`
- Never commit `allowed_origins: ['*']`
- If using `httpOnly` cookies: `supports_credentials: true` in Laravel AND `withCredentials: true` in Axios
- Vite proxy (`vite.config.ts`) can bypass CORS entirely in dev — configure `server.proxy` to forward `/api` to `http://localhost:8000`

**Detection:**
- `Access-Control-Allow-Origin` header missing or `*` in staging
- Network tab shows preflight OPTIONS requests failing with 403

**Phase:** Foundation (Phase 1) — configure correctly before any API calls are written.

---

### Pitfall 4: Zustand Cart State Not Persisted — Lost on Refresh

**What goes wrong:**
Cart items are stored only in Zustand memory. User adds 3 items, refreshes the page, cart is empty. For a non-authenticated user, this is especially bad: they can't continue shopping across sessions.

**Why it happens:**
Zustand stores are in-memory by default. Persistence requires explicit `persist` middleware configuration.

**Consequences:**
- Abandoned carts due to accidental refreshes
- Users must re-add items they selected
- Very visible UX failure

**Prevention:**
Use Zustand's `persist` middleware with `localStorage`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      addItem: (item: CartItem) => { /* ... */ },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ items: state.items }), // only persist items, not actions
    }
  )
);
```

- Call `clearCart()` explicitly after successful order placement
- Do NOT persist sensitive data (tokens, user PII) via `persist` middleware

**Detection:**
- Add item to cart, press F5 — cart empty = pitfall hit

**Phase:** Customer features / Cart (Phase 2-3)

---

### Pitfall 5: React Router v6 Protected Route Flicker on Refresh

**What goes wrong:**
User is logged in with a valid token in localStorage. They navigate to `/admin/dashboard` and refresh. For a brief moment (50-200ms), the app reads auth state as `false` (store not yet hydrated) and redirects to `/login`. The redirect happens before the token is validated, so authenticated users get bounced to login and then back — visible flicker or worse, infinite redirect loop.

**Why it happens:**
Zustand store initializes synchronously but if token validation involves an async API call (`/auth/me`), there's a window where `isAuthenticated` is indeterminate.

**Consequences:**
- Flash of login page for authenticated users
- Infinite redirect loop if login page redirects authenticated users back to dashboard
- State management bugs when the redirect triggers partial component unmounts mid-request

**Prevention:**
Add an `isLoading` (or `isInitializing`) state to the auth store:

```typescript
// In auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true until first auth check completes
}

// In ProtectedRoute component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) return <PageLoader />; // spinner, not a redirect
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

- Initialize `isInitializing: true`, set to `false` after the initial `/auth/me` check in `App.tsx` `useEffect`

**Detection:**
- Refresh while on a protected route — watch for flash of login page
- Open Network tab: if `/auth/me` fires after a redirect to `/login`, you have the bug

**Phase:** Authentication (Phase 1-2)

---

### Pitfall 6: Zustand Selector Over-subscription Causing Re-renders

**What goes wrong:**
Component subscribes to the entire Zustand store instead of selecting only the slice it needs. Any state change anywhere in the store (cart count updates, user profile loads) re-renders unrelated components — product list, navigation, checkout form — causing performance degradation at scale.

**Why it happens:**
```typescript
// BAD: subscribes to entire store
const store = useProductStore();
const products = store.products;

// GOOD: selector isolates subscription
const products = useProductStore((state) => state.products);
```

The entire-store pattern is shown in introductory examples and feels simpler.

**Consequences:**
- Cascade re-renders on every store update
- Ant Design Table re-renders on cart changes, causing visible flicker
- Performance degrades as store grows (more state = more spurious renders)

**Prevention:**
- Always use selector functions: `useStore((state) => state.specificSlice)`
- For derived data, use `useMemo` or Zustand's `createSelector`-style pattern
- Split stores by domain: `useAuthStore`, `useCartStore`, `useProductStore` — no monolithic store
- Use React DevTools Profiler to spot excessive re-renders during development

**Detection:**
- React DevTools Profiler: components highlighted on unrelated state changes
- Console log in render body fires more than expected

**Phase:** Foundation (Phase 1) — set store architecture before building features.

---

## Moderate Pitfalls

---

### Pitfall 7: Ant Design Full Bundle Import Bloating Initial Load

**What goes wrong:**
```typescript
// BAD: imports entire AntD bundle
import { Button, Table, Form, Input } from 'antd';
```
Even with tree-shaking, Ant Design v5's full bundle adds ~500KB+ to the initial JS payload if CSS is not handled correctly. Mobile users on slow connections see a blank screen for several seconds.

**Why it happens:**
Ant Design v5 uses CSS-in-JS by default, which eliminates the need for a separate CSS import — but the trade-off is that component styles are injected at runtime, which can cause FOUC (Flash of Unstyled Content) and slightly delays first render.

**Prevention:**
- Vite + `@ant-design/cssinjs` handles tree-shaking automatically for components — individual imports are fine
- Use Ant Design's `ConfigProvider` at the root for theme customization instead of per-component overrides
- Lazy-load heavy admin panel routes: `const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))`
- Analyze bundle with `vite-bundle-visualizer` — run once before first production deploy

**Detection:**
- Lighthouse score < 70 on mobile
- `vite-bundle-visualizer` shows antd as > 30% of bundle

**Phase:** Foundation (Phase 1) — configure lazy loading for admin routes from day one.

---

### Pitfall 8: Ant Design Form Not Resetting Between Modal Opens

**What goes wrong:**
Admin opens "Edit Product" modal for Product A, closes it without saving, opens it for Product B — the form still shows Product A's data. Or: form is submitted successfully, modal closes, reopens for a new record, and the previous validation errors are still visible.

**Why it happens:**
Ant Design Form maintains internal state tied to the form instance. If the component is not unmounted (shared modal pattern), the form state persists between opens.

**Prevention:**
```typescript
// Option 1: Unmount on close (simplest)
{isModalOpen && <EditProductModal onClose={() => setIsModalOpen(false)} />}

// Option 2: Explicit reset in useEffect
useEffect(() => {
  if (isModalOpen && initialValues) {
    form.setFieldsValue(initialValues);
  } else if (!isModalOpen) {
    form.resetFields();
  }
}, [isModalOpen, initialValues]);
```

- Prefer Option 1 (unmount) for correctness; Option 2 if animation/performance matters

**Detection:**
- Open edit modal for record A, close, open for record B — stale data visible = pitfall hit

**Phase:** Admin panel (Phase 3-4)

---

### Pitfall 9: No Global Error Boundary Around API Errors

**What goes wrong:**
An unhandled promise rejection or unexpected API response shape causes a React component to throw during render. Without an Error Boundary, the entire app unmounts showing a blank white screen with no explanation. This is especially bad for the checkout flow — a network hiccup kills the page.

**Why it happens:**
Axios interceptors handle HTTP errors but cannot catch render-time errors from bad data shapes (e.g., API returns `null` where component expects an array).

**Prevention:**
- Wrap top-level routes in a React `ErrorBoundary` component
- Use a library like `react-error-boundary` for functional components
- Validate API responses at the service layer before passing to components (use Zod schemas or manual type guards)
- Always default arrays: `const products = response.data?.data ?? []`

**Detection:**
- Kill the backend while on the product list page — if the app goes blank, no error boundary exists

**Phase:** Foundation (Phase 1) — add error boundaries before building any features.

---

### Pitfall 10: Environment Variables Leaked Into Production Build

**What goes wrong:**
`VITE_API_URL`, `VITE_SOME_KEY` are prefixed with `VITE_` which means Vite embeds them in the built JavaScript bundle. Anyone can open DevTools and read them. For non-sensitive URLs this is fine, but developers sometimes put API keys or internal service URLs in Vite env vars thinking they're "backend only."

**Why it happens:**
Vite's env system (`.env`, `.env.production`) is well-documented, but the "prefix = frontend exposure" rule is easy to forget.

**Consequences:**
- Exposed internal service URLs in public JS bundle
- API keys for third-party services (if any are added later) exposed to public

**Prevention:**
- Rule: `VITE_` prefix = public, anything else = backend only
- Audit `.env.production` before each deploy: should contain only `VITE_API_URL` and similarly non-sensitive values
- Never put payment gateway keys, internal admin passwords, or database connection strings in `.env` files in the frontend repo
- Add `.env.local` and `.env.*.local` to `.gitignore`

**Detection:**
- Build the project, open `dist/assets/*.js`, search for your env var value — if found, it's in the bundle (expected for `VITE_` vars, a problem for secrets)

**Phase:** Foundation (Phase 1) — `.gitignore` and env discipline from day one.

---

### Pitfall 11: Laravel Sanctum vs. Tymon JWT — Different Auth Handshake

**What goes wrong:**
Project context says "JWT from Laravel" — this could mean either Laravel Sanctum (stateful SPA cookies or stateless tokens) or `tymon/jwt-auth` (standard JWT Bearer tokens). These have fundamentally different handshake flows:

- Sanctum SPA mode: requires `GET /sanctum/csrf-cookie` call before login, uses `httpOnly` cookies, no `Authorization` header
- Sanctum API tokens: Bearer token in header, no CSRF step, similar to tymon
- tymon/jwt-auth: `POST /auth/login` returns `{ access_token, refresh_token }`, Authorization: Bearer header

If the frontend assumes tymon format but the backend uses Sanctum SPA mode, every authenticated request will fail with 401 silently.

**Prevention:**
- **Define the auth contract before writing any frontend auth code** — confirm with backend: which package, which endpoints, token format, refresh mechanism
- Document in a `API_CONTRACT.md`: `POST /api/auth/login` request/response shape, `POST /api/auth/refresh` endpoint existence
- Add a "smoke test" auth flow as the first thing in Sprint 1

**Detection:**
- First API call after login returns 401 with no obvious error
- Network tab: `Authorization: Bearer undefined` means token was never set correctly

**Phase:** Authentication (Phase 1) — block work, resolve before writing interceptors.

---

### Pitfall 12: React Router v6 Navigate vs. window.location on Logout

**What goes wrong:**
After logout, calling `window.location.href = '/login'` is used as a "force redirect" shortcut. This works but:
1. The full page reload clears all Zustand stores (correct for auth) but also causes a flash and loses any pending state
2. Some interceptors call this redirect but the component tree may be mid-render, causing "Can't perform a React state update on an unmounted component" errors

More subtly: the Axios interceptor lives outside the React component tree and has no access to React Router's `useNavigate` hook — this is a common pattern that leads to messy workarounds.

**Prevention:**
Use a navigation event bus pattern to bridge the gap between Axios interceptors and React Router:

```typescript
// navigationService.ts — module-level singleton
let navigator: NavigateFunction | null = null;

export const setNavigator = (nav: NavigateFunction) => {
  navigator = nav;
};

export const navigateTo = (path: string) => {
  if (navigator) navigator(path);
  else window.location.href = path; // fallback
};

// In App.tsx
const navigate = useNavigate();
useEffect(() => { setNavigator(navigate); }, [navigate]);

// In Axios interceptor
navigateTo('/login');
```

**Detection:**
- Console errors about unmounted components after logout
- Login page doesn't show after token expiry redirect

**Phase:** Authentication + Foundation (Phase 1-2)

---

## Minor Pitfalls

---

### Pitfall 13: Ant Design Table Pagination Not Synced With URL

**What goes wrong:**
User navigates to page 3 of the product list, clicks a product, goes to detail page, hits back — returns to page 1 of the list. This is standard table behavior but feels broken to users.

**Prevention:**
Sync table pagination, filters, and sort to URL search params using React Router's `useSearchParams`:
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const currentPage = parseInt(searchParams.get('page') ?? '1');
```

**Phase:** Customer features (Phase 2-3) — add when building product list.

---

### Pitfall 14: Missing Debounce on Search Input

**What goes wrong:**
Search input fires an API call on every keystroke. User types "bồ câu" (6 chars) = 6 API calls. On slow connections, responses arrive out of order (the response for "b" arrives after the response for "bồ câu"), showing the wrong results.

**Prevention:**
- Debounce with `lodash.debounce` or a custom hook (300-500ms delay)
- Cancel pending requests with Axios `CancelToken` or use `AbortController`
- React Query or SWR handle this automatically — worth considering even if Zustand is used for app state

**Phase:** Customer features (Phase 2-3) — product search.

---

### Pitfall 15: TypeScript `any` Spreading From API Responses

**What goes wrong:**
API response types are typed as `any` because the API contract isn't finalized. `any` spreads through the codebase: `product.price.toFixed(2)` crashes at runtime when API returns `price` as a string.

**Prevention:**
- Create typed API response interfaces even before the backend is ready — use them as the contract definition
- Use `unknown` instead of `any` for untyped data — forces explicit type assertion
- Establish a `types/api.ts` file in Phase 1 and keep it the source of truth

**Phase:** Foundation (Phase 1) — type discipline from the start costs nothing extra.

---

### Pitfall 16: Vite Build Base Path Missing for Sub-directory Deployments

**What goes wrong:**
App is deployed to a sub-path (`https://example.com/pigeon-shop/`) but `vite.config.ts` has no `base` configured. All asset URLs in the built HTML are absolute (`/assets/index.js` instead of `/pigeon-shop/assets/index.js`). App loads a blank page in production.

**Prevention:**
```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  // ...
});
```

Set `VITE_BASE_PATH=/pigeon-shop/` in `.env.production` if needed.

**Phase:** Deployment (final phase) — but configure the pattern in Phase 1 to avoid surprises.

---

### Pitfall 17: React Router Missing Catch-All for SPA on Static Hosts

**What goes wrong:**
User bookmarks `/products/123` and navigates directly to it. The static server (Nginx, Apache, or hosting platform) tries to find a file at that path, fails, and returns 404. React Router never loads.

**Prevention:**
- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: `RewriteRule ^ /index.html [L]`
- Vite preview: handled automatically
- Hosting platforms (Vercel, Netlify): add `_redirects` or `vercel.json` rewrite rules

**Phase:** Deployment configuration.

---

### Pitfall 18: Cart Quantity Update Triggers Re-fetch of Product List

**What goes wrong:**
Cart store update (quantity change) and product store share a common parent state or trigger a global re-render that causes the product list to re-fetch. This happens when `useEffect` dependencies are over-specified or stores are not properly isolated.

**Prevention:**
- Keep cart store and product store completely separate — no shared references
- Product list data is server state (API data); cart is client state — consider React Query for product list to separate server/client state concerns

**Phase:** Customer features (Phase 2-3).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Foundation: Axios setup | Race condition on token refresh (Pitfall 1) | Implement queue pattern from day one |
| Foundation: Auth store | Protected route flicker (Pitfall 5) | Add `isInitializing` state before building routes |
| Foundation: Env config | Leaked secrets in build (Pitfall 10) | Set `.gitignore` + env audit in checklist |
| Authentication: JWT | Sanctum vs tymon contract mismatch (Pitfall 11) | Define API contract with backend before coding |
| Authentication: logout | Navigate hook inaccessible from interceptor (Pitfall 12) | Use navigation event bus pattern |
| Authentication: token storage | XSS via localStorage (Pitfall 2) | Decide on memory + httpOnly cookie strategy |
| Customer features: product list | Table pagination not URL-synced (Pitfall 13) | Use `useSearchParams` from the start |
| Customer features: search | Debounce missing, race conditions (Pitfall 14) | Debounce + AbortController |
| Customer features: cart | State lost on refresh (Pitfall 4) | Zustand `persist` middleware |
| Admin panel: CRUD modals | Stale form state between modal opens (Pitfall 8) | Unmount modals on close |
| Admin panel: tables | Full store subscription re-renders (Pitfall 6) | Selector discipline, split stores |
| Deployment | Missing SPA catch-all route (Pitfall 17) | Nginx `try_files` config |
| Deployment | Ant Design bundle size (Pitfall 7) | Lazy-load admin routes, bundle visualizer |

---

## Sources

**Note:** External research tools were unavailable during this research session. All findings are based on training knowledge of the specific library versions and patterns used in this stack. Confidence level is MEDIUM — the patterns described are well-documented in official docs and widely validated in the community, but should be verified against current library versions during implementation.

- Axios interceptors documentation: https://axios-http.com/docs/interceptors
- Zustand persist middleware: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- Zustand best practices: https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
- React Router v6 auth patterns: https://reactrouter.com/en/main/start/concepts
- Ant Design Form API: https://ant.design/components/form
- Vite env variables: https://vitejs.dev/guide/env-and-mode.html
- Laravel CORS (fruitcake): https://github.com/fruitcake/laravel-cors
