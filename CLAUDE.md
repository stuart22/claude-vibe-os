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

## Working with the User

The user is a product manager, not a software engineer. They interact at the product level:
- They test the running application and provide feedback about what they see
- They don't read code — explain decisions in product terms, not implementation terms
- Their feedback may be stream-of-consciousness (the feedback-triage skill handles this)
- At natural breakpoints, ask if they want to test ("want me to spin up the dev server so you can test?")
- When summarizing what you did, describe what changed from the user's perspective, not what files you edited

## Living Documentation

This project uses living documentation that you are responsible for maintaining:

### `.claude/current-focus.md`
Update after completing any significant task, at natural breakpoints, and whenever context usage exceeds 75%. This is the primary recovery mechanism after compaction.

### `docs/decisions.md`
**CHECK** before making architectural decisions — look for prior decisions that might be relevant or contradictory. **ADD** new entries when decisions are made. If a new decision contradicts an old one, flag it to the user before proceeding.

### `docs/architecture.md`
Update when new subsystems are added, major refactors happen, or component structure changes.

### `docs/features/*.md`
Update when implementation reveals the spec was wrong or incomplete. Don't silently deviate — update the spec so it reflects reality.

### This file (CLAUDE.md)
Update when architecture or conventions change materially. Keep it concise — this file is re-read after every compaction, so every line costs context.

## Session Workflow

### Starting a new session
1. Read `.claude/current-focus.md` to understand current state
2. If the user names a feature, read `docs/features/{feature}.md`
3. Check `docs/decisions.md` for relevant prior decisions
4. Use Plan mode to explore and propose an approach before building

### During work
5. Build in auto-accept mode after the user approves your plan
6. Run unit tests as you go (they're your quality gate)
7. At natural breakpoints, offer to spin up the dev server for testing
8. If the user provides multi-issue feedback, activate the feedback-triage skill

### Wrapping up
9. Update `.claude/current-focus.md` with current state
10. Log any new decisions to `docs/decisions.md`
11. Update this file if architecture or conventions changed
12. Commit documentation changes alongside code changes

## Context Management

The hooks in `.claude/hooks/` handle context management automatically:
- **StatusLine** shows context usage percentage with color-coded thresholds
- At **75%**, consider saving state to `current-focus.md`
- At **85%**, wrap up the current task and save state
- At **95%**, compaction is imminent — save everything immediately
- **PreCompact** hook creates a backup in `.claude/backups/`
- **SessionStart** hook reinjects context after compaction
- If recovery files seem insufficient, use `git log` and source files to fill gaps

## Project-Specific Notes

<!-- Claude Code: Add project-specific notes as the project evolves -->
<!-- Examples: -->
<!-- - "We use Zustand for state management, not Redux — see decisions.md entry from [date]" -->
<!-- - "The simulation engine runs client-side — no server-side computation" -->
<!-- - "All API calls go through src/api/client.ts — never call fetch directly" -->
