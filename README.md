# Vibecoding OS

A Claude Code plugin for building software when you're a product manager, not an engineer.

It scaffolds new projects from a product discovery conversation, keeps documentation alive as the project grows, turns your messy testing notes into ordered work, and refuses to let Claude call something "done" without proving it.

## Install

```bash
/plugin marketplace add stuart22/claude-vibe-os
```

```bash
/plugin install vibe-os@claude-vibe-os
```

Vibecoding OS leans on [Superpowers](https://github.com/obra/superpowers) for the engineering workflow underneath it — brainstorming, planning, TDD, debugging, code review. Install it too:

```bash
/plugin marketplace add obra/superpowers-marketplace
```

```bash
/plugin install superpowers@superpowers-marketplace
```

The security hooks run on Node.js, which you'll already have if you're building anything web-shaped. Everything else is plain Markdown.

### Staying updated

This is the reason Vibecoding OS is a plugin rather than a repository template: improvements reach projects you've already started, instead of being frozen at the moment you cloned. To pull them in:

```bash
/plugin update vibe-os
```

Restart Claude Code afterwards to load the new version.

## Start a project

In an empty directory:

```
set up a new project
```

That runs `vibe-init`, which will:

1. Interview you about what you're building — the problem, the users, the core loop, the features, how it should feel. It pushes back rather than just transcribing.
2. Write your discovery documents into `docs/`.
3. Recommend a tech stack, explained in product terms, and wait for your approval.
4. Generate the living docs — architecture, decisions log, testing map — and a `CLAUDE.md` tuned to your project.
5. Split your features into individual specs in dependency order.
6. Scaffold the codebase and confirm it runs.

No feature code — just the foundation. Then:

```
let's work on [first feature]
```

If you'd rather do discovery elsewhere (a claude.ai conversation, for instance), drop `vision.md` and `features.md` into `docs/` first and `vibe-init` will pick up from there.

## What you get

**Skills**

| | |
|---|---|
| `vibe-init` | Discovery interview, stack decision, living docs, and codebase scaffold |
| `feedback-triage` | Turns stream-of-consciousness testing notes into a prioritized list — blocking bugs first, cosmetics last — and confirms the order before touching code |
| `design-options` | Builds 2-3 genuinely different working UI alternatives you can click through, then cleans up the losers |
| `visual-check` | Screenshots the running app after UI changes so Claude sees layout bugs before you do |
| `quality-gate` | E2E tests, a mutation check that proves those tests actually fail when the feature breaks, and a security scan |

**Commands** — `/check` runs the quality gate. `/feedback` triages testing notes.

**Hooks** — secrets are blocked at commit time, dangerous code patterns (XSS, SQL injection, `eval`) are flagged at commit time, dependency installs are audited for known vulnerabilities, and recursive deletes aimed at your project root or home directory are blocked. These run in every project while the plugin is enabled; disable it per-project if you don't want that.

## Philosophy

- **You work at the product level.** Test the app, give feedback, make decisions. Claude handles the code.
- **Documentation stays alive.** The decisions log, architecture, and test coverage map are maintained as the project changes, not written once and abandoned.
- **Claude picks the stack.** Your discovery docs describe what you're building, not how.
- **"Done" has to be proven.** A test that passes whether or not the feature works is worse than no test, so the quality gate breaks each new test on purpose to check that it notices.
- **Security is automatic.** The hooks run whether or not anyone remembered to think about it.

## Migrating from the template

Vibecoding OS used to be a repository template you cloned. Projects created that way keep working untouched. To move one onto the plugin:

1. Install the plugin as above.
2. Delete `.claude/skills/`, `.claude/hooks/`, and `.claude/commands/` from the project, along with the `hooks` and `StatusLine` blocks in `.claude/settings.json`.
3. Keep your `CLAUDE.md` and `docs/` — they're yours. Update skill references to their namespaced names (`vibe-os:quality-gate`, `superpowers:brainstorming`, and so on).

The context-management hooks that shipped with the template — the statusline monitor, pre-compaction backup, and session re-injection — are gone. Claude Code handles compaction natively now.

## Working on the plugin

This repository *is* the plugin, and also the marketplace that serves it. `CLAUDE.md` covers the layout and conventions; `docs/superpowers/specs/` holds the design specs behind larger changes.

To try a local change before pushing it, point a marketplace at your checkout:

```bash
/plugin marketplace add /absolute/path/to/claude-vibe-os
```

Two things worth knowing if you contribute: security patterns belong in `hooks/patterns.mjs` only — both the commit-time hooks and the scanner that `quality-gate` runs import from there, so adding a pattern anywhere else means the two can disagree. And instructions should carry policy rather than procedure: the decisions and gates a model can't infer, not command incantations or checklists it already knows. That's what keeps these skills useful as models improve.

## License

MIT
