---
phase: 01-foundation-authentication
plan: 01
subsystem: infra
tags: [vite, react, typescript, zustand, tanstack-query, antd, axios, react-router, vitest, eslint, prettier]

requires: []

provides:
  - Vite 6 + React 18.3 + TypeScript project scaffold with production build
  - All production dependencies installed (react-router-dom, zustand, axios, tanstack-query, antd, zod)
  - All dev dependencies installed (vitest, testing-library, eslint 9, prettier, jsdom)
  - Clean architecture folder structure under src/
  - Multi-environment configuration (.env.development/staging/production)
  - Typed env wrapper (src/config/env.ts)
  - Shared TypeScript API types (src/types/api.ts) matching Laravel auth contract
  - Vitest + jsdom test infrastructure with @testing-library/jest-dom
  - ESLint 9 flat config with prettier integration

affects:
  - 01-02 (auth store and axios instance - imports from src/types/api.ts)
  - 01-03 (router config - uses src/router/ folder structure)
  - 01-04 (admin login page - uses src/pages/admin/, antd)
  - All subsequent plans (all imports depend on established folder structure)

tech-stack:
  added:
    - vite@6.4.1
    - react@18.3.1
    - react-dom@18.3.1
    - react-router-dom@6.30.3
    - zustand@5.0.12
    - "@tanstack/react-query@^5.51"
    - antd@^5.20
    - "@ant-design/icons@^5.4"
    - axios@^1.7
    - zod@^3.23
    - typescript@^5.5
    - vitest@2.1.9
    - "@testing-library/react@^16"
    - "@testing-library/jest-dom@^6"
    - jsdom@^25
    - eslint@^9
    - prettier@^3.3
    - typescript-eslint@^8
  patterns:
    - Vite 6 with @vitejs/plugin-react (Babel variant)
    - ESLint 9 flat config (eslint.config.js) with prettier integration
    - TypeScript strict mode with tsconfig.app.json references pattern
    - Vitest with separate vitest.config.ts (not co-located with vite.config.ts)
    - Environment variables prefixed with VITE_ for browser exposure
    - Typed env accessor pattern via src/config/env.ts

key-files:
  created:
    - package.json
    - vite.config.ts
    - tsconfig.json / tsconfig.app.json / tsconfig.node.json
    - eslint.config.js
    - .prettierrc
    - .gitignore
    - index.html
    - src/main.tsx
    - src/App.tsx
    - src/vite-env.d.ts
    - src/config/env.ts
    - src/types/api.ts
    - vitest.config.ts
    - src/test/setup.ts
    - src/test/smoke.test.ts
    - .env.development
    - .env.staging
    - .env.production
    - .env.example
  modified: []

key-decisions:
  - "Used React 18.3 (not 19) — AntD 5.x peer-dep constraint; do not upgrade until AntD explicitly supports React 19"
  - "Vitest has separate vitest.config.ts rather than co-located with vite.config.ts — avoids vitest glob matching vite.config in exclusion patterns"
  - "Added smoke test (src/test/smoke.test.ts) to ensure vitest exits 0 even before real tests are written"
  - "ESLint flat config includes prettier integration via eslint-config-prettier to prevent rule conflicts"
  - "@types/react-dom required explicit full npm reinstall (rm -rf node_modules) — initial scaffold lock file was out of sync"

patterns-established:
  - "Pattern 1: All src/ imports use relative paths (no path aliases configured)"
  - "Pattern 2: Environment variables accessed via src/config/env.ts — never access import.meta.env directly in feature code"
  - "Pattern 3: TypeScript interfaces for API shapes live in src/types/api.ts"
  - "Pattern 4: Test files in src/test/ directory (not colocated with source)"

requirements-completed: [FOUND-01, FOUND-02, FOUND-03]

duration: 8min
completed: 2026-03-28
---

# Phase 1 Plan 01: Project Scaffold Summary

**Vite 6 + React 18.3 + TypeScript greenfield scaffold with full dependency set, clean architecture folders, multi-environment config, and Vitest infrastructure — zero TypeScript errors, build and tests pass**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-28T10:38:33Z
- **Completed:** 2026-03-28T10:46:16Z
- **Tasks:** 2
- **Files modified:** 39

## Accomplishments

- Full Vite 6 project bootstrapped with all 9 production dependencies and 14 dev dependencies installed (React 18.3, Zustand 5, AntD 5, TanStack Query 5, Axios, Zod, React Router v6)
- Clean architecture folder structure established under src/ with 14 subdirectories covering api, stores, hooks, components/common, layouts, pages/admin, pages/customer, router, lib, config, types, test
- Multi-environment configuration with 3 env files + typed env wrapper + shared API types matching Laravel auth contract decisions (D-02, D-04, D-05)
- Vitest + jsdom test infrastructure validated with passing smoke test

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project, install all dependencies, create folder structure** - `8cda044` (feat)
2. **Task 2: Create environment config, shared types, and test infrastructure** - `6991dc6` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified

- `package.json` — All dependencies with pinned versions; React 18.3, Zustand 5, AntD 5.20, vitest, testing-library
- `vite.config.ts` — Vite 6 config with @vitejs/plugin-react
- `tsconfig.app.json` — TypeScript strict mode, react-jsx, bundler module resolution
- `eslint.config.js` — ESLint 9 flat config with react-hooks, react-refresh, prettier integration
- `.prettierrc` — single quotes, trailing commas, 100 char print width
- `.gitignore` — Excludes node_modules, dist, .env.local, .env.*.local
- `src/main.tsx` — ReactDOM.createRoot with React.StrictMode
- `src/App.tsx` — Minimal placeholder component
- `src/config/env.ts` — Typed wrapper for VITE_API_BASE_URL, DEV, PROD
- `src/types/api.ts` — LoginRequest, LoginResponse, UserProfile, ApiError interfaces
- `vitest.config.ts` — jsdom environment, globals true, setupFiles pointing to src/test/setup.ts
- `src/test/setup.ts` — @testing-library/jest-dom import
- `src/test/smoke.test.ts` — Smoke test verifying jsdom environment
- `.env.development` — VITE_API_BASE_URL=http://localhost:8000/api
- `.env.staging` — VITE_API_BASE_URL=https://staging.banchimbocau.vn/api
- `.env.production` — VITE_API_BASE_URL=https://api.banchimbocau.vn/api

## Decisions Made

- Used React 18.3 (not 19) per CLAUDE.md constraint — AntD 5.x peer-dep compatibility
- Vitest has a separate vitest.config.ts file — avoids exclusion pattern issues when vite.config.ts is in vitest's root
- Added smoke test to ensure `npx vitest run` exits 0 before any real tests are written (no-test exit code is 1)
- ESLint flat config keeps eslint-plugin-react-refresh from the scaffold (good for HMR DX) and adds eslint-config-prettier to prevent formatting rule conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Full npm reinstall required to resolve @types/react-dom not installing**
- **Found during:** Task 1 (build verification)
- **Issue:** Initial `npm create vite@6 temp-scaffold` generated a lock file targeting React 19. After downgrading to React 18 in package.json and running `npm install`, npm kept the stale lock file and deduped away `@types/react-dom` (105 packages instead of expected 365). Build failed with "Could not find declaration file for module 'react-dom/client'"
- **Fix:** Deleted `node_modules/` and `package-lock.json`, then ran `npm install` fresh to generate a correct lock file with all 365 packages
- **Files modified:** package-lock.json regenerated
- **Verification:** `@types/react-dom` appeared in node_modules/@types/, `npm run build` exited 0
- **Committed in:** 8cda044 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added smoke test file to ensure vitest exits 0**
- **Found during:** Task 2 (vitest verification)
- **Issue:** `npx vitest run` exits with code 1 when no test files are found. Plan specified "npx vitest run exits with code 0 (no tests yet, but config is valid)" — this is contradicted by vitest's behavior
- **Fix:** Added `src/test/smoke.test.ts` with a single test verifying jsdom environment (window is an object)
- **Files modified:** src/test/smoke.test.ts
- **Verification:** `npx vitest run --reporter=verbose` shows 1 passed, exits 0
- **Committed in:** 6991dc6 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes necessary for build/test verification to succeed. No scope creep. The smoke test is a permanent fixture that validates test infrastructure on every run.

## Issues Encountered

- Vite scaffold generates React 19 by default — required explicit package.json override to React 18.3 and full reinstall to get consistent lock file

## User Setup Required

None - no external service configuration required. Backend URL is pre-configured in .env.development.

## Next Phase Readiness

- Build infrastructure ready: `npm run dev`, `npm run build`, `npm run test` all work
- Folder structure established: Plan 02 can create src/stores/authStore.ts, Plan 03 can create src/router/index.tsx
- API types ready: LoginRequest, LoginResponse, UserProfile available for auth store and axios interceptors
- No blockers for Phase 1 Plan 02 (Axios instance + auth store)

## Self-Check: PASSED

All created files verified on disk. Both task commits confirmed in git log.

---
*Phase: 01-foundation-authentication*
*Completed: 2026-03-28*
