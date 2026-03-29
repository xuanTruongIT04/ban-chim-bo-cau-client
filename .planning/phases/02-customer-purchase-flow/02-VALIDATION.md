---
phase: 02
slug: customer-purchase-flow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

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
| 02-01-01 | 01 | 1 | PROD-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PROD-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CART-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | CHECKOUT-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs created alongside implementation tasks
- [ ] Existing infrastructure covers Phase 1 smoke test + auth store tests

*Existing infrastructure covers base requirements. Phase 2 tests added per-task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cart persists across page refresh | CART-04 | Requires browser localStorage interaction | Add item, refresh page, verify item still in cart |
| Product images display correctly | PROD-05 | Visual verification needed | Navigate to product detail, check image renders |
| Checkout form submits and shows confirmation | CHECKOUT-03 | Full E2E flow | Fill form, submit, verify confirmation page |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
