# Vibecoding OS — plugin repository

> Re-read every turn — keep it short.

This repo *is* the `vibe-os` Claude Code plugin, and also the marketplace that serves it. It contains no application code.

## Layout

- `.claude-plugin/plugin.json` — plugin manifest. Bump `version` on every user-visible change.
- `.claude-plugin/marketplace.json` — marketplace listing, `source: "./"` (the repo is the plugin).
- `skills/` — one directory per skill, each with `SKILL.md`. `vibe-init` also bundles `discovery-interview.md` and `templates/`.
- `commands/` — thin pointers to skills. Never restate a skill's process here; it drifts.
- `hooks/` — `hooks.json` wires the scripts. All security patterns live in `patterns.mjs` and are imported by both the commit-time hooks and `scan.mjs`, which `quality-gate` runs. Add patterns there only.

## Writing instructions here

The audience is a current-generation model, so write **policy, not procedure**: the decisions, gates, and priorities it can't infer. Leave out command incantations, regex listings, output templates, and generic checklists — those age badly and cost tokens every load. If an instruction only restates what a capable model would already do, delete it.

Keep the two audiences straight: skills in `skills/` instruct Claude, while `skills/vibe-init/templates/CLAUDE.md` is generated *into the user's project* and must read as that project's own instructions.

## Conventions

- Hooks fail open (`exit 0`) on any error. Only `secret-guard` and `rm-guard` block, and only on genuine matches.
- Skills reference each other by namespaced name: `vibe-os:quality-gate`, `superpowers:brainstorming`.
- Superpowers is a soft dependency — reference its skills by name, never copy their content, so their updates flow through automatically.

## Testing a change

Install the local checkout as a marketplace and exercise the affected surface — trip the hook, run the skill — before pushing. `docs/superpowers/specs/` holds the design specs behind larger changes.
