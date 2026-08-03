---
name: quality-gate
description: "Activate before claiming work is complete, before committing significant work, or when the user runs /check. Runs E2E tests, proves those tests actually catch regressions, and scans for security issues. Do NOT activate for trivial changes like typo fixes or comment updates."
---

# Quality Gate

Before you say "done," prove it. Four phases, in order. Don't skip phases because a change seems small.

## Phase 1 — E2E suite

Run the E2E suite against the running app. If `tests/e2e/` doesn't exist yet and this is the first user-facing feature, set up Playwright, then record the setup in `docs/testing.md` and the choice in `docs/decisions.md`.

If the current feature has no E2E coverage, say so and write it now. A test navigates to a real page, interacts as a user would, and asserts on user-visible outcomes — text appearing, elements visible, navigation happening — never on CSS classes, DOM structure, or internal state. Give each test a `// GUARDS:` comment naming the regression it prevents.

**Do not proceed to Phase 2 until the suite is green.** Fix failures, re-run, then continue.

## Phase 2 — Mutation check

**This is the phase that matters most, and it is not optional.** A test that passes whether or not the feature works is worse than no test — it manufactures false confidence.

For each E2E test written this session:

1. Identify what the test actually claims to verify.
2. Break that thing in the source — remove the text, hide the element, break the route.
3. Re-run that single test and **confirm it fails.** If it still passes, the test isn't testing what it claims. Rewrite it.
4. Restore the code and confirm the test passes again.

Skip this phase only when no new tests were written. Report how many tests you verified.

## Phase 3 — Security scan

Run the scanner bundled with this plugin. It lives at `hooks/scan.mjs`, two directories up from this skill's own directory (given to you when this skill loads). Use that absolute path — your working directory is the user's project, not the plugin.

```bash
node "<plugin>/hooks/scan.mjs" --all
```

It checks secrets, dangerous code patterns, and dependency vulnerabilities. By default it scans uncommitted changes; if the session's work is already committed on a branch, scan the whole branch instead:

```bash
node "<plugin>/hooks/scan.mjs" --all --since main
```

The patterns live in the scanner rather than in this skill, so it can't drift from the commit-time hooks.

## Phase 4 — Summary

Report E2E results (passing/total, how many new tests were mutation-verified) and the three security results together, then a clear verdict: ready to complete, or what has to be fixed first.

**Be honest.** If something is wrong, say so plainly and don't rationalize it away. The user is trusting this gate to mean something.

## Afterwards

- **Critical security findings:** fix before completing.
- **Warnings:** may be deferred — note the deferral and the reason in `docs/decisions.md`.
- **New tests:** update the coverage map in `docs/testing.md`.
