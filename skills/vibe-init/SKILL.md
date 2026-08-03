---
name: vibe-init
description: "Set up a new project from scratch — runs product discovery, recommends a tech stack, generates living docs, and scaffolds the codebase. Use when starting a new project, when the user says 'set up this project', 'start a new project', 'vibe init', or when a directory contains discovery docs (vision.md, features.md) but no code yet."
---

# Vibe Init

Turns an empty directory into a project ready to build: discovery docs, a tech stack decision, living documentation, and a scaffolded codebase. No feature code — foundation only.

## Preflight

1. **Superpowers check.** This project's workflow references Superpowers skills by name. Verify it's installed:
   ```bash
   ls -d ~/.claude/plugins/cache/*/superpowers* 2>/dev/null
   ```
   If nothing is found, tell the user to install it and wait:
   ```
   /plugin marketplace add obra/superpowers-marketplace
   /plugin install superpowers@superpowers-marketplace
   ```
   They can choose to continue without it — the generated CLAUDE.md still works, its skill references just won't resolve.

2. **Git check.** If not a git repo, offer `git init`.

3. **Non-empty directory.** If the directory already has code and no discovery docs, ask whether to adopt an existing codebase (generate docs to match what's there) or stop. Don't scaffold over existing work.

## Step 1 — Discovery

Two paths. Ask which applies:

- **Docs already exist** — the user did discovery elsewhere and has `docs/vision.md` and `docs/features.md` (optionally `docs/personas-and-flows.md`, `docs/ux-direction.md`). Read them and go to Step 2.
- **Run discovery now** — read `discovery-interview.md` in this skill directory and conduct the interview. It produces the same documents.

## Step 2 — Recommend a tech stack

Read every document in `docs/`. Recommend a stack with rationale grounded in the technical implications of what they're building — not general popularity. Cover language/framework, data layer, auth, hosting, and anything the features demand (real-time, offline, payments).

The user is a product manager. Explain each choice in terms of what it means for the product: speed to build, what it makes easy later, what it rules out. **Get approval before proceeding.**

## Step 3 — Generate living docs

Create these from the templates in this skill's `templates/` directory, filled in for the actual project:

- `docs/architecture.md` — system structure implied by the approved stack
- `docs/decisions.md` — seeded with the stack decision as the first entry
- `docs/testing.md` — coverage map and test conventions
- `CLAUDE.md` — project instructions (use `templates/CLAUDE.md`, replacing the project overview, architecture summary, and any stack-specific conventions)

Then split `docs/features.md` into `docs/features/*.md`: one file per feature, each scoped to roughly one session of work, ordered by dependency. Name them `NN-feature-name.md` so the build order is visible.

## Step 4 — Scaffold

Initialize the project: package/dependency setup, folder structure, base config, linting, and a running dev server. Verify it actually runs before reporting success.

Do not write feature code. The goal is a foundation the user can immediately start building features on.

## Step 5 — Hand off

Tell the user what exists now and what to say next (`let's work on [first feature]`). Point them at `docs/features/` for the build order.

## Notes

- Everything generated here is a living document. The project CLAUDE.md instructs future sessions to maintain them.
- If the user's discovery docs contradict each other, surface it before scaffolding — that's cheaper to fix now.
