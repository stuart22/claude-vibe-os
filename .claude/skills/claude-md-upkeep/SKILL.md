---
name: claude-md-upkeep
description: "Activate this skill after making architectural decisions, changing project conventions, completing significant features, or when any of the living documentation files (CLAUDE.md, decisions.md, current-focus.md, architecture.md) may be out of date. Also activate at the start of a new session if the project already has these files, to verify they reflect reality. This skill runs in the background of normal work — it should not interrupt the user unless documentation reveals a conflict."
---

# CLAUDE.md Upkeep — Living Documentation

## Purpose

This project uses living documentation that must stay accurate. Stale docs are worse than no docs — they cause you to make decisions based on outdated information. This skill defines what to maintain, when to update it, and how.

## The living documents

### `CLAUDE.md` (project root)
**What it is:** The project's identity — architecture, conventions, coding patterns, and instructions for how to work in this codebase.
**When to update:** After significant architectural changes, new conventions established, new dependencies added, or patterns that future sessions need to know about.
**What NOT to put here:** Temporary state (that's `current-focus.md`), decision history (that's `decisions.md`), or feature details (those are in `docs/features/`).

### `.claude/current-focus.md`
**What it is:** A snapshot of where work stands RIGHT NOW. This file is your primary recovery mechanism after compaction.
**When to update:** After completing any significant task, at natural breakpoints, before stepping away, and whenever the StatusLine shows context usage above 75%.
**Format:**
```markdown
# Current Focus

## Last completed
- [What was just finished, with enough detail to resume context]

## In progress
- [What's actively being worked on, current state]

## Open questions
- [Decisions pending user input]
- [Technical uncertainties being investigated]

## Key context for this session
- [Anything a fresh session would need to know that isn't in CLAUDE.md]

## Next up
- [What should be tackled next, in priority order]
```

### `docs/decisions.md`
**What it is:** A running record of architectural and product decisions with rationale. This is an ACTIVE REFERENCE, not an append-only log.
**When to CHECK it:** Before making any architectural decision — look for prior decisions that might be relevant or contradictory.
**When to ADD to it:** After any decision about technology choices, data models, patterns, UX approaches, or anything where "why did we do it this way?" might come up later.
**Format:**
```markdown
## [Date] — [Decision title]
**Context:** [What prompted this decision]
**Decision:** [What was decided]
**Rationale:** [Why — this is the most important part]
**Alternatives considered:** [What else was on the table]
**Implications:** [What this means for future work]
```

### `docs/architecture.md`
**What it is:** How the system fits together — the big picture.
**When to update:** When new subsystems are added, major refactors happen, or the component structure changes meaningfully.

### `docs/features/*.md`
**What they are:** Individual feature specifications.
**When to update:** When implementation reveals the spec was wrong or incomplete. Don't silently deviate from the spec — update it so it reflects reality.

## Operational rules

### At session start
1. Read `current-focus.md` to understand where things stand
2. Scan `decisions.md` for recent entries relevant to today's work
3. If anything in `CLAUDE.md` seems outdated based on the codebase, flag it to the user

### During work
4. After completing a significant task, update `current-focus.md`
5. Before making an architectural decision, check `decisions.md` for relevant prior decisions
6. After making an architectural decision, add it to `decisions.md`
7. If a new coding pattern or convention emerges, add it to `CLAUDE.md`

### At natural breakpoints (user testing, end of feature, stepping away)
8. Ensure `current-focus.md` reflects the current state
9. If `CLAUDE.md` needs updates, make them
10. Commit documentation changes alongside code changes — never separately

### Conflict detection
If you discover that a prior decision in `decisions.md` conflicts with what you're about to do:
- **Stop and flag it to the user.** Don't silently override past decisions.
- Present the conflict: "In [date], we decided [X] because [reason]. What I'm about to do would change that. Should I proceed?"
- If the user approves the change, update `decisions.md` with the new decision and mark the old one as superseded.

## Important

- **Documentation updates should be lightweight.** A few sentences, not paragraphs. If you're writing more than 5-6 lines for a decisions.md entry, you're over-documenting.
- **current-focus.md is ephemeral.** It's overwritten constantly. Don't treat it as a history — that's what git is for.
- **CLAUDE.md is authoritative.** If there's a conflict between CLAUDE.md and something in conversation, CLAUDE.md wins. Update it if it's wrong.
- **Never skip documentation to save time.** The 30 seconds you spend updating current-focus.md saves 10 minutes of confusion after compaction.
