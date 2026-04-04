---
name: check
description: "Run the full quality gate: E2E tests, test validity, and security scan"
---

Activate the `quality-gate` skill to run a comprehensive check on the current state of the project.

Run all four phases:
1. **E2E Regression Suite** — Run all E2E tests, fix any failures
2. **Test Validity (Mutation Check)** — Verify any new tests actually catch regressions
3. **Security Scan** — Dependency audit, code vulnerability scan, secret scan
4. **Summary** — Present the consolidated quality gate results

Present the full summary report before taking any action. If there are failures or issues, present the report first and ask how the user wants to proceed — do not start fixing things automatically.
