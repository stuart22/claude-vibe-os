# Testing

> Living document. Update the coverage map as features are built.

## Layers

`superpowers:test-driven-development` covers unit and integration tests during implementation. `vibe-os:quality-gate` covers E2E and security before completion. Both are required: unit tests verify logic, E2E tests verify the user's experience.

`vibe-os:visual-check` screenshots the running app after UI changes — that's Claude looking at its own work during development, distinct from the E2E regression suite.

## E2E Framework

**Default:** Playwright (`@playwright/test`). To switch, log the decision in `docs/decisions.md` and update this file.

Tests live in `tests/e2e/{feature-name}.spec.ts`, one file per feature, named to match `docs/features/`. Each test navigates to a real page, interacts as a user would, and asserts on user-visible outcomes — never on CSS classes, DOM structure, or internal state. Every test carries a `// GUARDS:` comment naming the regression it prevents.

## Coverage Map

| Feature | E2E Test File | Key Assertions |
|---------|---------------|----------------|
| *(none yet)* | | |

## Security Checks

| Check | Trigger | Enforcement |
|-------|---------|-------------|
| Secret detection | `git commit` / `git add` | **Blocks** if secrets found in staged changes |
| Code vulnerability scan | `git commit` | **Warns** on dangerous patterns (XSS, SQLi, eval) |
| Dependency audit | after install commands | **Warns** on critical/high vulnerabilities |
| Full scan | `/check` | Advisory — part of the quality gate |

The first three run automatically as hooks from the `vibe-os` plugin.
