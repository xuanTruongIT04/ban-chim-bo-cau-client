---
phase: 03
slug: admin-panel
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-29
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DASH-01 | unit | `npx vitest run src/api/admin/__tests__ --reporter=verbose` | TDD co-located | pending |
| 03-02-01 | 02 | 2 | DASH-03 | typecheck | `npx tsc --noEmit` | N/A (UI) | pending |
| 03-02-02 | 02 | 2 | APROD-01 | typecheck | `npx tsc --noEmit` | N/A (UI) | pending |
| 03-02-03 | 02 | 2 | APROD-02 | typecheck | `npx tsc --noEmit` | N/A (UI) | pending |
| 03-03-01 | 03 | 2 | AORD-01 | typecheck | `npx tsc --noEmit` | N/A (UI) | pending |
| 03-03-02 | 03 | 2 | AORD-02 | typecheck | `npx tsc --noEmit` | N/A (UI) | pending |

*Status: pending / green / red / flaky*

---

## Nyquist Compliance Note

Plan 03-01 uses TDD where tests are co-located with implementation (written in the same task as RED-GREEN cycle). This satisfies the Nyquist sampling requirement because:
1. Tests are written BEFORE implementation (RED phase)
2. Implementation is verified immediately (GREEN phase)
3. The automated verify command runs the co-located tests

UI-only tasks (Plans 03-02, 03-03) use `npx tsc --noEmit` as their automated verify command, which confirms TypeScript correctness. Full behavioral verification is deferred to the Plan 03-04 human checkpoint.

---

## Wave 0 Requirements

- [x] Test stubs created alongside implementation tasks (TDD pattern in Plan 01)
- [x] Existing Phase 1 + 2 test infrastructure covers base requirements
- [x] UI tasks use `npx tsc --noEmit` for automated signal

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Product image upload to S3 | APROD-04 | Requires backend S3 integration | Create product, upload image, verify image displays |
| Order status workflow | AORD-03 | Full E2E state machine flow | Move order through all statuses, verify transitions |
| Dashboard data accuracy | DASH-01 | Requires seeded backend data | Check dashboard counters match actual DB state |
| Product stock split accuracy | DASH-03 | Requires real product data | Check in-stock/out-of-stock counts match actual products |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
