# Project: [PROJECT NAME]

> **This CLAUDE.md is a living document.** Update it when architecture, conventions, or project context changes materially. It is re-read from disk after every context compaction, making it the most durable piece of project memory.

## Project Overview

<!-- Claude Code: Replace this section after reading the discovery docs in docs/ -->
This project has not been initialized yet. Run the setup process:
1. Read all documents in `docs/` (vision.md, features.md, and any others present)
2. Recommend a tech stack with rationale based on the technical implications in the docs
3. After user approval, generate `docs/architecture.md`
4. Break `docs/features.md` into individual files in `docs/features/`, each scoped to roughly one session of work, ordered by dependency
5. Initialize `docs/decisions.md` with the tech stack decision
6. Scaffold the codebase (project init, dependencies, folder structure, base config)
7. Replace this section with actual project context

## Architecture

<!-- Claude Code: Replace with architecture summary after setup -->
Not yet initialized. See setup process above.

## Coding Conventions

<!-- Claude Code: Add project-specific conventions as they emerge -->
- Follow the patterns established in the codebase — consistency over personal preference
- When introducing a new pattern, document it here
- Unit tests are your quality gate — run them as you build, not as a separate step
- Every feature implementation should end in a testable state the user can interact with

## Testing & Security

### Visual Validation
After implementing any user-visible change, use the `visual-check` skill to verify it looks correct. Don't wait for the user to report visual bugs — catch them yourself by screenshotting the running app with Playwright MCP.

### Regression Testing
This project uses Playwright for E2E tests in `tests/e2e/`. Every user-facing feature should have at least one E2E test covering the core flow. E2E tests assert on what the user sees (text, visibility, navigation), not implementation details.

The `superpowers:test-driven-development` skill handles unit/integration tests. The `quality-gate` skill handles E2E tests and security. Both are required — unit tests verify logic, E2E tests verify the user's experience.

### Test Validity
New E2E tests must pass a mutation check: temporarily break the feature, confirm the test fails, restore. This proves the test catches real regressions. The `quality-gate` skill handles this automatically.

### Security
Three automated hooks enforce security:
- **Secret guard** — hard-blocks commits containing API keys, tokens, or credentials
- **Dependency audit** — warns after package installs if vulnerabilities are found
- **Code scan** — warns on commit if dangerous patterns (XSS, SQLi, eval) are detected

Address Critical findings before completing work. Warnings can be deferred with a note in `docs/decisions.md`.

## Working with the User

The user is a product manager, not a software engineer. They interact at the product level:
- They test the running application and provide feedback about what they see
- They don't read code — explain decisions in product terms, not implementation terms
- Their feedback may be stream-of-consciousness (the feedback-triage skill handles this)
- At natural breakpoints, ask if they want to test ("want me to spin up the dev server so you can test?")
- When summarizing what you did, describe what changed from the user's perspective, not what files you edited
- They work across Claude Code CLI (sometimes with worktrees) and IDE environments like Emdash — don't assume a specific tooling setup

## Living Documentation

This project uses living documentation that you are responsible for maintaining:

### `docs/decisions.md`
**CHECK** before making architectural decisions — look for prior decisions that might be relevant or contradictory. **ADD** new entries when decisions are made. If a new decision contradicts an old one, flag it to the user before proceeding.

### `docs/architecture.md`
Update when new subsystems are added, major refactors happen, or component structure changes.

### `docs/features/*.md`
Update when implementation reveals the spec was wrong or incomplete. Don't silently deviate — update the spec so it reflects reality.

### `docs/testing.md`
Update the coverage map when E2E tests are added or changed. Update security configuration if hooks are modified.

### This file (CLAUDE.md)
Update when architecture or conventions change materially. Keep it concise — this file is re-read after every compaction, so every line costs context.

## Session Workflow

### Starting a new session
1. If the user names a feature, read `docs/features/{feature}.md`
2. Check `docs/decisions.md` for relevant prior decisions
3. Use `superpowers:brainstorming` before any creative or feature work to explore intent and requirements
4. For multi-step tasks, use `superpowers:writing-plans` to produce an implementation plan before touching code

### During work
5. Build after the user approves your plan
6. Use `superpowers:test-driven-development` — write tests as you build, not as a separate step. For user-facing features, also plan the E2E test.
7. Use `superpowers:dispatching-parallel-agents` when facing 2+ independent tasks
8. Use `superpowers:systematic-debugging` when hitting bugs or unexpected behavior — diagnose before fixing
9. After user-visible changes, use the `visual-check` skill to verify the UI. Then offer to let the user test.
10. If the user provides multi-issue feedback, activate the feedback-triage skill

### Before completing work
11. Use `superpowers:verification-before-completion` before claiming anything is done
12. Run the `quality-gate` skill (or `/check`) — E2E tests, mutation check, security scan. Address Critical findings.
13. Use `superpowers:requesting-code-review` for significant features
14. Use `superpowers:finishing-a-development-branch` when ready to integrate

### Wrapping up
When the user signals they're closing the session (e.g., "update docs", "I'm going to close this session", "save context for next time"):
15. Update `docs/testing.md` coverage map if new E2E tests were added
16. Save a `project`-type memory capturing: what was done this session, what's in progress, open questions, and suggested next steps
17. Log any new decisions to `docs/decisions.md`
18. Update this file if architecture or conventions changed
19. Commit documentation changes alongside code changes

## Project-Specific Notes

<!-- Claude Code: Add project-specific notes as the project evolves -->
<!-- Examples: -->
<!-- - "We use Zustand for state management, not Redux — see decisions.md entry from [date]" -->
<!-- - "The simulation engine runs client-side — no server-side computation" -->
<!-- - "All API calls go through src/api/client.ts — never call fetch directly" -->
