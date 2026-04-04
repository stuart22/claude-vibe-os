# Testing & Security for Vibe Coding OS

**Date:** 2026-03-28
**Status:** Design approved, pending implementation

## Problem

When vibecoding rapidly, two categories of risk compound:

1. **Tests that don't catch bugs.** Unit tests pass but the app is broken. Code-level tests verify isolated functions while the user experiences the composed system visually. The gap between "tests pass" and "it actually works" is where bugs hide.
2. **Security gaps introduced at speed.** AI pulls vulnerable dependencies, writes code with XSS/SQLi patterns, or generates configs that leak secrets. Moving fast means these slip through unnoticed.

## Solution Overview

A layered system that weaves testing and security into the existing vibe coding OS workflow:

- **3 hooks** for automated security enforcement (secrets, deps, code patterns)
- **2 skills** for testing process (visual validation, quality gate)
- **1 command** (`/check`) for PM-triggered quality checks
- **1 living doc** (`docs/testing.md`) for test coverage tracking
- **CLAUDE.md modifications** for session workflow integration

### Architecture Principle

**Hooks for enforcement** (must never be skipped), **skills for process** (require judgment and context). Hard blocks only where the cost of a miss is catastrophic (leaked credentials). Warnings for everything else.

---

## Hooks (Automated Enforcement)

### 1. `secret-guard.mjs` — Hard Block on Secrets

**Location:** `.claude/hooks/secret-guard.mjs`
**Type:** PreToolUse on `Bash` matcher
**Severity:** BLOCK (exit 2)

Intercepts `git commit` and `git add` commands. Inspects staged diff for high-confidence secret patterns:

- AWS access keys (`AKIA[0-9A-Z]{16}`)
- Private keys (`-----BEGIN.*PRIVATE KEY-----`)
- Generic secrets: `API_KEY=`, `SECRET=`, `TOKEN=`, `PASSWORD=` followed by a value
- `.env` files being staged

On match: exit 2 with descriptive message telling Claude what was found and how to fix it (remove from staging, add to `.gitignore`).

**Why hard block:** Leaked credentials are catastrophic and irreversible. False positives here are a minor inconvenience; false negatives can be a security incident.

### 2. `dep-audit.mjs` — Warn on Vulnerable Dependencies

**Location:** `.claude/hooks/dep-audit.mjs`
**Type:** PostToolUse on `Bash` matcher
**Severity:** WARN (exit 0 with message)

Intercepts dependency install commands (`npm install`, `yarn add`, `pip install`, `cargo add`, etc.). After install completes, runs the appropriate audit:

- npm/yarn: `npm audit --json` / `yarn audit --json`
- pip: `pip audit` (if available)
- cargo: `cargo audit` (if available)

Surfaces critical and high vulnerabilities as a warning message. Does not block — Claude sees the warning and can address it or note it.

**Why warn, not block:** Dependencies are installed during development flow. Blocking would be too disruptive, and sometimes you need a dependency even if it has a moderate vulnerability.

### 3. `code-scan.mjs` — Warn on Code Vulnerability Patterns

**Location:** `.claude/hooks/code-scan.mjs`
**Type:** PreToolUse on `Bash` matcher
**Severity:** WARN (exit 0 with message)

Intercepts `git commit` commands. Scans changed files (from `git diff --cached`) for common vulnerability patterns:

- `innerHTML` / `dangerouslySetInnerHTML` without sanitization context
- SQL string concatenation (`query(` + variable, template literals with `SELECT`)
- `eval()`, `new Function()`, `child_process.exec()` with string arguments
- Hardcoded HTTP URLs (not HTTPS)
- Overly permissive CORS configuration (`*`)

Reports findings categorized as Warning. Does not block.

**Why warn, not block:** Many of these patterns have legitimate uses (e.g., `innerHTML` with sanitized content, `eval` in build tools). Blocking would cause excessive false positives. Warning gives Claude the signal to review.

### Hook Integration with `settings.json`

All three hooks are added to the existing `settings.json` alongside the current destructive command blocker and notification hooks.

---

## Skills

### 1. `visual-check` — Claude Looks at What It Built

**Location:** `.claude/skills/visual-check/SKILL.md`
**Trigger:** After implementing any user-visible change (UI component, page, style, layout). Also when user asks "does it look right?" or "show me what it looks like."

**Process:**
1. **Ensure dev server is running.** Detect framework from `package.json` (look for `dev`, `start`, `serve` scripts). Start it if needed. Note the port.
2. **Identify what to check.** Based on the changes just made, determine which URL(s) to visit.
3. **Navigate and screenshot.** Use Playwright MCP `browser_navigate` + `browser_take_screenshot`.
4. **Evaluate the screenshot.** Check against:
   - Feature spec in `docs/features/` (if available)
   - Visual bugs (overlapping elements, missing content, broken layout)
   - Does it look like a real application (not placeholder/default state)?
5. **Report to user in product terms.** Describe what it looks like and flag any issues.
6. **If issues found:** Fix and re-check (max 3 iterations).

**Key distinction:** Uses **Playwright MCP plugin** (Claude drives a browser and sees screenshots) — NOT the Playwright test runner. The MCP plugin is for Claude's eyes. The test runner is for automated regression.

### 2. `quality-gate` — Comprehensive Pre-Completion Check

**Location:** `.claude/skills/quality-gate/SKILL.md`
**Trigger:** Before claiming work is complete, before committing significant work, or when user runs `/check`.

**Phase 1: E2E Regression Suite**
1. Check if `tests/e2e/` exists. If first feature, set up Playwright test runner: `npm init playwright@latest`, configure for project's dev server. Log setup to `docs/testing.md`.
2. Run E2E suite: `npx playwright test`. Parse results.
3. If failures: report, fix, re-run. Do not proceed until green.
4. If no E2E tests cover the current feature: flag it. "No E2E tests cover [feature]. Should I write them?"

**Phase 2: Test Validity — Mutation Check**
For E2E tests written in the current session:
1. Identify the core assertion in each new test
2. Temporarily break the feature (e.g., remove the text it checks for, hide the element it expects)
3. Re-run just that test — confirm it **fails**
4. Restore the code
5. Report: "Verified N new tests actually catch regressions"

This only runs on tests written in the current session, not the full suite. Keeps it fast.

**Phase 3: Security Scan**
1. **Dependency audit:** Detect package manager, run audit. Report critical/high.
2. **Code vulnerability scan:** Grep changed files for dangerous patterns (same patterns as code-scan hook, but as a comprehensive review rather than just a commit check).
3. **Secret scan:** Scan working tree for secret patterns (catches unstaged secrets too).

**Phase 4: Summary**
```
Quality Gate Results:
- E2E Tests: 12/12 passing (2 new, verified)
- Security - Dependencies: 0 critical, 1 moderate
- Security - Code: 0 issues
- Security - Secrets: Clean
Ready to complete.
```

---

## Command

### `/check` — Manual Quality Gate Trigger

**Location:** `.claude/commands/check.md`

Activates the `quality-gate` skill. Runs all phases and presents the summary. Gives the PM a single gesture: "is everything OK?"

---

## Living Documentation

### `docs/testing.md`

A template that tracks:
- E2E framework in use (default: Playwright, overridable via `docs/decisions.md`)
- Test file structure and naming (`tests/e2e/{feature-name}.spec.ts`)
- Coverage map: which features have E2E tests, what they assert on
- Security configuration (which hooks are active)
- How to run tests manually

Updated by Claude as features are built. The coverage map is the key artifact — it answers "what's tested?" at a glance.

---

## CLAUDE.md Modifications

### New Section: "Testing & Security"

Added between "Coding Conventions" and "Working with the User":

- Visual validation: After user-visible changes, use `visual-check` skill
- Regression testing: Playwright for E2E in `tests/e2e/`, every user-facing feature needs coverage
- Security: Commit hooks block secrets, warn on vulnerabilities. Address Critical findings before completing.
- Relationship to superpowers: TDD skill handles unit/integration, quality-gate handles E2E + security

### Session Workflow Changes

| Step | Current | New |
|------|---------|-----|
| 6 | Use TDD | Use TDD for logic. **For user-facing features, also plan the E2E test.** |
| 9 | Offer to spin up dev server | **After user-visible changes, use `visual-check` skill.** Then offer user testing. |
| 11 | Use verification-before-completion | Use verification, **then run `quality-gate` (or `/check`).** Address Critical findings. |
| New | — | **Update `docs/testing.md` coverage map if new E2E tests were added.** |

---

## What the PM Experiences

A typical session:

1. "Let's build the dashboard"
2. Claude brainstorms, plans, builds (existing flow)
3. Claude: *"Let me check how this looks."* Screenshots via Playwright. *"Dashboard renders with stats cards and chart. Sidebar was overlapping — fixed. Want to test it yourself?"*
4. PM tests, provides feedback via `/feedback`
5. Claude fixes issues, writes E2E tests
6. Claude: *"Quality Gate: 5/5 passing (1 new, verified). No security issues. Dependencies clean."*
7. Commit succeeds. Secret guard runs silently. Dep audit runs if anything was installed.

The PM never thinks about testing frameworks, security scanners, or test validity.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.claude/hooks/secret-guard.mjs` | Create | Hard block secrets in commits |
| `.claude/hooks/dep-audit.mjs` | Create | Warn on vulnerable dependencies |
| `.claude/hooks/code-scan.mjs` | Create | Warn on code vulnerability patterns |
| `.claude/skills/visual-check/SKILL.md` | Create | Visual validation during development |
| `.claude/skills/quality-gate/SKILL.md` | Create | E2E tests + mutation check + security scan |
| `.claude/commands/check.md` | Create | PM-triggered quality gate |
| `docs/testing.md` | Create | Living test coverage documentation |
| `.claude/settings.json` | Modify | Add 3 new hooks |
| `CLAUDE.md` | Modify | New Testing & Security section + workflow changes |
| `README.md` | Modify | Document new testing/security capabilities |

---

## Integration with Superpowers Plugin

The quality-gate skill complements existing superpowers skills:

- **`superpowers:test-driven-development`** handles unit/integration tests during implementation
- **`quality-gate`** handles E2E tests and security before completion
- **`superpowers:verification-before-completion`** runs first (verifies commands succeed), then quality-gate adds E2E + security layer
- **`superpowers:systematic-debugging`** — visual-check can be used to see bugs visually during debugging
- **`superpowers:requesting-code-review`** — reviewer can reference E2E coverage from `docs/testing.md`

---

## Defaults and Overrides

| Default | How to Override |
|---------|----------------|
| Playwright for E2E | Log decision in `docs/decisions.md`, update `docs/testing.md` |
| `tests/e2e/` directory | Configure in `docs/testing.md` |
| Secret patterns (regex) | Modify `secret-guard.mjs` directly |
| Code scan patterns | Modify `code-scan.mjs` directly |
| Dep audit command | `dep-audit.mjs` auto-detects; override by editing hook |
