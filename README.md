# Vibecoding OS — Project Template

A starter repo for PM-driven development with Claude Code. Clone this template to bootstrap any new project with context management, living documentation, and product workflow automation pre-wired.

## Quick Start

### 1. Create your project
Use GitHub's "Use this template" button, or:
```bash
gh repo create my-project --template your-username/vibecoding-template --clone
cd my-project
```

### 2. Run product discovery
Paste the [discovery prompt](https://github.com/your-username/vibecoding-os/blob/main/discovery-prompt.md) into a new claude.ai conversation. Work through the product discovery process.

### 3. Drop in discovery docs
Download the markdown artifacts from claude.ai and place them in `docs/`:
```
docs/
├── vision.md              ← required
├── features.md            ← required
├── personas-and-flows.md  ← optional (smaller projects may skip)
└── ux-direction.md        ← optional (smaller projects may skip)
```

### 4. Initialize with Claude Code
Open Claude Code in the project directory and say:
```
read the docs and set up this project
```

Claude Code will read your discovery documents, recommend a tech stack, scaffold the codebase, and wire everything up. No feature code yet — just foundation.

### 5. Build
Start building features:
```
let's work on [feature name]
```

## What's Included

### CLAUDE.md
Project identity and conventions. Tells Claude Code how to work in this project — session workflow, documentation rules, user interaction patterns. Evolves as the project grows.

### Skills (`.claude/skills/`)
- **feedback-triage** — Organizes messy testing feedback into prioritized issues
- **design-options** — Generates 2-3 UI alternatives as working prototypes
- **claude-md-upkeep** — Keeps living documentation accurate
- **context-recovery** — Guides recovery after context compaction

### Hooks (`.claude/hooks/`)
- **context-monitor.mjs** — StatusLine showing context usage with threshold warnings
- **pre-compact-backup.mjs** — Saves structured backup before compaction
- **session-reinject.sh** — Restores context after compaction

### Commands (`.claude/commands/`)
- `/feedback` — Explicitly triggers feedback triage for testing notes

### Docs (`docs/`)
- Discovery docs (you provide)
- `decisions.md` — Living decision log (Claude Code maintains)
- `architecture.md` — System architecture (Claude Code generates)
- `features/` — Individual feature specs (Claude Code breaks down from features.md)

### MCP Servers (`.mcp.json`)
Pre-configured: GitHub (PR/issue management) + Context7 (live documentation)

## Recommended Companion Plugins

Install these globally for best results:
```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

- **Superpowers** — Engineering workflow (brainstorm→plan→execute, TDD, code review)
- **frontend-design** — Production-grade UI quality

## Philosophy

This template is designed for product managers and non-SWEs who build with AI coding assistants. The core principles:

- **You work at the product level.** Test the app, provide feedback, make decisions. Claude handles the code.
- **Context is precious.** Hooks and skills manage the context window so you don't have to manually split sessions.
- **Documentation stays alive.** CLAUDE.md, decisions.md, and current-focus.md are actively maintained by Claude — not write-once artifacts.
- **Claude picks the stack.** Discovery docs describe what you're building, not how. Claude Code recommends the technology based on your product needs.
