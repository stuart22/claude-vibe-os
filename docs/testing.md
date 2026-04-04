# Testing Strategy

> This is a living document. Claude Code updates it as features are built and test coverage grows.

## E2E Framework

**Default:** Playwright (`@playwright/test`)

To switch frameworks, log the decision in `docs/decisions.md` and update this file.

## Test Structure

```
tests/
└── e2e/
    └── {feature-name}.spec.ts    # One file per feature or user flow
```

**Naming convention:** `{feature-name}.spec.ts` — maps directly to a feature in `docs/features/`.

**Test style:**
- Navigate to a real page in the running app
- Interact as a user would (click, type, submit)
- Assert on user-visible outcomes (text, visibility, navigation)
- Include a `// GUARDS:` comment describing what regression the test prevents

## Coverage Map

<!-- Claude Code: Update this table as features are built -->

| Feature | E2E Test File | Key Assertions |
|---------|---------------|----------------|
| *(none yet)* | | |

## Security Configuration

| Check | Type | Enforcement |
|-------|------|-------------|
| Secret detection | Commit hook | **Blocks** commit if secrets found in staged changes |
| Dependency audit | Install hook | **Warns** after npm/yarn/pip install if vulnerabilities found |
| Code vulnerability scan | Commit hook | **Warns** if dangerous patterns (XSS, SQLi, eval) found |
| Full security scan | Quality gate skill | **Advisory** — runs as part of `/check` |

## Running Tests

| Command | What it does |
|---------|-------------|
| `npx playwright test` | Run full E2E suite |
| `npx playwright test tests/e2e/{name}.spec.ts` | Run a single test file |
| `npx playwright test --ui` | Open Playwright's interactive UI mode |
| `/check` | Run full quality gate (E2E + security scan) |
