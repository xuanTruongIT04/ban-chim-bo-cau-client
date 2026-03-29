# Deferred Items — Phase 02

## Pre-existing test failures (out of scope for 02-01)

These failures existed before Phase 02-01 execution. They are from Phase 01 work and should be resolved in a follow-up.

### authApi.test.ts — 6 failing tests
- Tests expect `POST /auth/login` but implementation uses `POST /admin/login`
- Tests expect `GET /me` but implementation throws (backend route not implemented)
- Tests expect `POST /auth/logout` but implementation uses `POST /admin/logout`
- Root cause: authApi.ts was updated to match actual backend routes, but authApi.test.ts was written to a hypothetical contract

### authStore.test.ts — 1 failing test
- `partialize only includes token (not user or isInitializing)` fails
- The test accesses `persistApi.getOptions()` but the persist configuration may not expose this in the test environment
