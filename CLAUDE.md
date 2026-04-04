# Project: [PROJECT NAME]

> This file is re-read every turn — keep it concise. Rules and pointers live here; detailed process belongs in skills, docs/, and feature specs. When architecture, conventions, or project context changes, update any of those docs as needed.

## Project Overview

This project has not been initialized yet. Run the setup process:
1. Read all documents in `docs/` (vision.md, features.md, and any others present)
2. Recommend a tech stack with rationale based on the technical implications in the docs
3. After user approval, generate `docs/architecture.md`
4. Break `docs/features.md` into individual files in `docs/features/`, each scoped to roughly one session of work, ordered by dependency
5. Initialize `docs/decisions.md` with the tech stack decision
6. Scaffold the codebase (project init, dependencies, folder structure, base config)
7. Replace this section with actual project context

## Architecture

Not yet initialized. See setup process above.

## Coding Conventions

- Follow the patterns established in the codebase — consistency over personal preference
- Unit tests are your quality gate — run them as you build, not as a separate step
- Every feature implementation should end in a testable state the user can interact with

## Testing & Security

- After UI changes, use `visual-check` skill to screenshot and verify before showing the user
- Every user-facing feature needs an E2E test in `tests/e2e/` — assert on what the user sees, not implementation details
- `superpowers:test-driven-development` for unit tests; `quality-gate` for E2E + security
- New E2E tests must pass mutation check (quality-gate handles this automatically)
- Security hooks run automatically: secrets blocked on commit, dep vulnerabilities warned on install, dangerous code patterns warned on commit
- Address Critical security findings before completing. Defer Warnings with a note in `docs/decisions.md`
- See `docs/testing.md` for framework config, coverage map, and test commands

## Working with the User

The user is a product manager, not a software engineer. They interact at the product level:
- They don't read code — explain decisions in product terms, not implementation terms
- Their feedback may be stream-of-consciousness (the feedback-triage skill handles this)
- When summarizing what you did, describe what changed from the user's perspective, not what files you edited
- At natural breakpoints, offer to let them test the running app

## Living Docs

You maintain these — check before decisions, update after changes:
- `docs/decisions.md` — check before architectural decisions, add entries after. Flag contradictions.
- `docs/architecture.md` — update on subsystem/structural changes
- `docs/features/*.md` — update when implementation diverges from spec. Don't silently deviate.
- `docs/testing.md` — update coverage map when E2E tests change

## Session Workflow

**Start:** Read `docs/features/{feature}.md` + `docs/decisions.md`. Use `superpowers:brainstorming` before creative work, `superpowers:writing-plans` for multi-step tasks.

**Build:** `superpowers:test-driven-development` as you go (include E2E for user-facing features). `visual-check` after UI changes. `superpowers:dispatching-parallel-agents` for independent tasks. `superpowers:systematic-debugging` for bugs. `feedback-triage` for multi-issue feedback.

**Complete:** `superpowers:verification-before-completion` → `quality-gate` (or `/check`) → `superpowers:requesting-code-review` for major features → `superpowers:finishing-a-development-branch`.

**Wrap up:** Update `docs/testing.md` coverage map, save project memory, log decisions to `docs/decisions.md`, update this file if needed, commit docs with code.

## Project-Specific Notes

<!-- Add as the project evolves -->
