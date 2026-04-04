---
name: quality-gate
description: "Activate this skill before claiming work is complete, before committing significant work, or when the user runs /check. This is the comprehensive 'is everything OK?' check that runs E2E tests, validates test quality, and scans for security issues. Do NOT activate for trivial changes like typo fixes or comment updates."
---

# Quality Gate

## Purpose

Before you say "done," prove it. This skill runs a comprehensive check: E2E regression tests, test validity verification, and a security scan. It ensures the app actually works (not just that unit tests pass) and that no security issues were introduced.

## When to activate

- Before claiming any significant work is complete
- Before committing a feature or major change
- When the user runs `/check`
- After fixing bugs reported through feedback triage

## Process

### Phase 1: E2E Regression Suite

#### First-time setup (if no tests exist yet)

If the `tests/e2e/` directory doesn't exist and this is the first user-facing feature:

1. Initialize Playwright test runner:
   ```bash
   npm init playwright@latest -- --yes --quiet
   ```
2. Configure `playwright.config.ts` to use the project's dev server (detect from `package.json`)
3. Create the `tests/e2e/` directory
4. Log the setup to `docs/testing.md`
5. Log the decision to `docs/decisions.md`

#### Running the suite

1. Ensure the dev server is running (same detection as the `visual-check` skill)
2. Run the E2E suite:
   ```bash
   npx playwright test
   ```
3. Parse the output for pass/fail counts

#### Handling results

- **All passing:** Report count and move to Phase 2
- **Failures:** Report which tests failed and why. Fix the failures. Re-run. Do not proceed to Phase 2 until green.
- **No tests for current feature:** Flag it: "No E2E tests cover [feature]. I'll write them now." Then write tests that cover the core user flow for the feature.

#### What makes a good E2E test

Each E2E test should:
- Navigate to a real page in the running app
- Interact with the feature as a user would (click, type, submit)
- Assert on **user-visible outcomes** (text appears, element is visible, page navigates)
- NOT assert on implementation details (CSS classes, DOM structure, internal state)
- Include a descriptive comment: `// GUARDS: Prevents regression where [description of what could break]`

### Phase 2: Test Validity — Mutation Check

**Only run this for E2E tests written during the current session.** Skip if no new tests were written.

For each new E2E test:

1. **Identify the core assertion.** What is the test actually checking? (e.g., "dashboard shows username after login")
2. **Temporarily break it.** Make a minimal change that should cause the test to fail:
   - If the test checks for text content: remove or change that text
   - If the test checks for element visibility: hide the element
   - If the test checks for navigation: break the route
3. **Re-run just that test:**
   ```bash
   npx playwright test tests/e2e/{test-file}.spec.ts
   ```
4. **Confirm it fails.** If the test still passes after breaking the feature, the test is not actually testing the thing — rewrite it.
5. **Restore the code.** Undo the temporary break. Confirm the test passes again.
6. **Report:** "Verified N new tests actually catch regressions."

This mutation check proves tests are real — they fail when the feature breaks. This is the antidote to tests that always pass regardless of app state.

### Phase 3: Security Scan

#### 3a: Dependency audit

1. Detect the package manager (check for `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Cargo.lock`, `requirements.txt`)
2. Run the appropriate audit command:
   - npm: `npm audit --json`
   - yarn: `yarn audit --json`
   - pnpm: `pnpm audit --json`
   - pip: `pip audit --format=json`
   - cargo: `cargo audit --json`
3. Parse results, count by severity (critical, high, moderate, low)
4. For critical/high: list the affected packages and suggested fix

#### 3b: Code vulnerability scan

Scan files changed since the last commit (`git diff --name-only HEAD`) for patterns:

- `innerHTML =` (XSS risk)
- `dangerouslySetInnerHTML` (XSS risk)
- `eval(`, `new Function(` (code injection)
- `child_process.exec` with template literals (command injection)
- SQL string concatenation (SQL injection)
- `http://` URLs in non-test files (downgrade attacks)
- CORS `origin: '*'` (overly permissive)

Report matches with file, line, and advice.

#### 3c: Secret scan

Scan the working tree for accidentally committed secrets:

- AWS keys: `AKIA[0-9A-Z]{16}`
- Private keys: `-----BEGIN.*PRIVATE KEY-----`
- Generic secrets: `(API_KEY|SECRET|TOKEN|PASSWORD)\s*[=:]\s*["']?\S{8,}`
- Check for `.env` files that are tracked by git (not in `.gitignore`)

### Phase 4: Summary

Present a single summary to the user:

```
Quality Gate Results:
──────────────────────────────────
E2E Tests:     12/12 passing (2 new, verified)
Security:
  Dependencies: 0 critical, 0 high, 1 moderate
  Code scan:    0 issues
  Secrets:      Clean
──────────────────────────────────
✅ Ready to complete.
```

Or if there are issues:

```
Quality Gate Results:
──────────────────────────────────
E2E Tests:     10/12 passing — 2 FAILED
  ✗ tests/e2e/dashboard.spec.ts: chart not rendering
  ✗ tests/e2e/auth.spec.ts: redirect timeout
Security:
  Dependencies: 1 critical (lodash CVE-2024-xxxx)
  Code scan:    1 warning (innerHTML in src/components/Widget.tsx:42)
  Secrets:      Clean
──────────────────────────────────
❌ Fix 2 test failures and 1 critical vulnerability before completing.
```

## After the quality gate

- **All green:** Proceed with commit/completion
- **Test failures:** Fix them, re-run just the failing tests, then re-run the full quality gate summary
- **Critical security findings:** Fix before completing. Log the fix.
- **Warning/moderate findings:** Can be deferred — note them in `docs/decisions.md` with rationale for deferring
- **Update `docs/testing.md`:** If new E2E tests were added, update the coverage map

## Important notes

- **Don't skip phases.** Even if "it's just a small change," run all phases. Small changes break things too.
- **The mutation check is not optional** for new tests. A test that doesn't fail when the feature breaks is worse than no test — it gives false confidence.
- **Be honest in the summary.** If something is wrong, say so. Don't rationalize warnings away. The PM trusts this gate to be accurate.
- **Update docs/testing.md** after running the gate if test coverage changed.
