---
phase: 1
slug: foundation-authentication
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vitest.config.ts (created in Plan 01-01, Task 2) |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --coverage` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | FOUND-01, FOUND-02 | build | `npm run build` | N/A (scaffold) | pending |
| 01-01-T2 | 01 | 1 | FOUND-03 | unit | `npx vitest run --reporter=verbose` | vitest.config.ts | pending |
| 01-02-T1 | 02 | 2 | FOUND-04, FOUND-07, FOUND-08, FOUND-10 | unit | `npx vitest run src/stores/__tests__/authStore.test.ts --reporter=verbose` | W0 | pending |
| 01-02-T2 | 02 | 2 | FOUND-05, FOUND-09 | unit | `npx vitest run src/api/__tests__/axiosInstance.test.ts --reporter=verbose` | W0 | pending |
| 01-03-T1 | 03 | 3 | FOUND-06, AUTH-05 | build+unit | `npx tsc --noEmit && npx vitest run --reporter=verbose` | N/A | pending |
| 01-03-T2 | 03 | 3 | FOUND-09 | build+unit | `npm run build && npx vitest run --reporter=verbose` | N/A | pending |
| 01-04-T1 | 04 | 4 | AUTH-01, AUTH-02, AUTH-03 | unit+build | `npx vitest run --reporter=verbose && npm run build` | W0 | pending |
| 01-04-T2 | 04 | 4 | AUTH-01 through AUTH-05 | manual | human verification | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/test/setup.ts` — Vitest setup with jsdom + Testing Library (Plan 01-01, Task 2)
- [ ] `src/stores/__tests__/authStore.test.ts` — tests for auth store (Plan 01-02, Task 1)
- [ ] `src/api/__tests__/axiosInstance.test.ts` — tests for Axios interceptors (Plan 01-02, Task 2)
- [ ] `src/api/__tests__/authApi.test.ts` — tests for auth API module (Plan 01-04, Task 1)
- [ ] Vitest + @testing-library/react install if not present (Plan 01-01, Task 1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page refresh preserves login session | AUTH-03 | Requires real browser localStorage persistence | Login -> refresh page -> verify no redirect to /admin/login |
| Logout redirects immediately | AUTH-02 | Requires navigation flow | Click logout -> verify redirect to /admin/login within 1s |
| 401 from API triggers re-login | AUTH-05 | Requires real API or mock server | Expire token -> make API call -> verify redirect to /admin/login |

---

## Sampling Continuity Check

Consecutive tasks without Vitest automated verify:

- 01-01-T1 (build only, no vitest — vitest config not yet created) — ACCEPTABLE: scaffold task, vitest infra created in next task
- All subsequent tasks include `npx vitest run` in their verify command
- No 3+ consecutive tasks without Vitest automated verify

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
