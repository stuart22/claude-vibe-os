# Design: Convert claude-vibe-os from template repo to plugin

**Date:** 2026-07-30
**Status:** Approved for planning

## Problem

claude-vibe-os is a "Use this template" starter repo. Every project cloned from it
gets a frozen copy of the skills, hooks, and commands — improvements never reach
existing projects. Claude Code conventions have since consolidated around plugins
(installed once, shared across all projects, updated centrally). Additionally, much
of the instruction content was written for weaker models and over-specifies
procedure the current models supply on their own.

## Goals

1. Distribute the vibe-os workflow as a plugin installable by the author and others.
2. Replace the template-clone + claude.ai-discovery flow with a single init skill.
3. Slim all instruction files: keep policy (decisions, gates, conventions), drop
   procedure (command incantations, regex patterns, output templates, generic
   checklists). Target ~60% reduction of instruction surface.
4. Stay coupled to the Superpowers ecosystem by referencing its skills by name, so
   their prompt updates flow through automatically.

## Non-goals

- Resurrecting the removed context-management hooks (pre-compact-backup,
  session-reinject, context-recovery, claude-md-upkeep). They didn't work well and
  the product now handles compaction natively.
- A separate marketplace repo. This repo serves as both plugin and marketplace.
- Hard dependency enforcement on Superpowers (no mechanism exists; init checks
  instead).

## New repo structure

```
claude-vibe-os/
├── .claude-plugin/
│   ├── plugin.json          # name: vibe-os, version, description, author
│   └── marketplace.json     # single-entry marketplace listing this plugin
├── skills/
│   ├── vibe-init/           # NEW — discovery + project scaffold
│   │   ├── SKILL.md
│   │   └── claude-md-template.md   # template for generated project CLAUDE.md
│   ├── feedback-triage/     # carried over, slimmed
│   ├── design-options/      # carried over, slimmed
│   ├── visual-check/        # carried over, slimmed
│   └── quality-gate/        # carried over, slimmed
├── commands/
│   ├── check.md             # slimmed to pointer + command-specific behavior
│   └── feedback.md          # slimmed to pointer
├── hooks/
│   ├── hooks.json           # plugin hook config using ${CLAUDE_PLUGIN_ROOT}
│   ├── secret-guard.mjs     # carried over (blocks secrets on commit)
│   ├── code-scan.mjs        # carried over (warns on dangerous patterns)
│   └── dep-audit.mjs        # carried over (warns on vulnerable deps)
└── README.md                # rewritten for plugin install flow
```

Removed relative to today: the project-level `.claude/` directory (settings.json,
skills, hooks, commands move into plugin form), `CLAUDE.md` at repo root (its
content becomes the vibe-init template), `discovery-prompt.md` (absorbed into
vibe-init), context-monitor statusline, macOS notification hook.

Kept: the inline `rm -rf` blocker moves into `hooks/hooks.json`. `docs/` stays as
the repo's own documentation home (specs, decisions), no longer a scaffold to copy.

## Install story

```
/plugin marketplace add stuart22/claude-vibe-os
/plugin install vibe-os@claude-vibe-os
```

Updates ship by pushing to main; users pull via plugin update. Skills surface as
`vibe-os:vibe-init`, `vibe-os:quality-gate`, etc. Hooks activate in every project
where the plugin is enabled.

## The vibe-init skill

Replaces both the template clone and the claude.ai discovery shuffle. Invoked in a
new or empty directory ("set up a new project", "vibe init"):

1. **Preflight:** check Superpowers plugin is installed; if not, print the two
   install commands and pause. Check directory is a git repo (offer `git init`).
2. **Discovery:** two entry points —
   - Run the discovery interview in-session (the substance of today's
     discovery-prompt.md, condensed), producing `docs/vision.md` and
     `docs/features.md`, optionally `docs/personas-and-flows.md` and
     `docs/ux-direction.md`.
   - Or accept pre-made discovery docs the user drops into `docs/`.
3. **Setup flow** (today's CLAUDE.md setup section): read docs → recommend tech
   stack with rationale → on approval generate `docs/architecture.md` → split
   features.md into `docs/features/*.md` scoped to ~one session each, dependency
   ordered → seed `docs/decisions.md` (with stack decision) and `docs/testing.md`
   → scaffold the codebase (init, deps, folders, config — no feature code).
4. **Generate project CLAUDE.md** from the bundled template: PM working style,
   living-docs rules, security policy, session workflow referencing
   `superpowers:*` and `vibe-os:*` skills by name.

The generated CLAUDE.md is the slimmed version of today's post-init CLAUDE.md
(see audit decisions below).

## Superpowers relationship

Soft dependency, checked at init. The generated CLAUDE.md and vibe-os skills
reference Superpowers skills by name only — never copy their content — so
Superpowers prompt updates reach every project automatically. If Superpowers is
missing, references silently no-op; the init check is the mitigation.

## Instruction audit decisions (modernization pass)

Principle: keep WHAT/POLICY, drop HOW/PROCEDURE. Applied per file:

| File | Today | Target | Keep | Drop |
|------|-------|--------|------|------|
| quality-gate | 163 lines | ~50 | Mutation check discipline; phase order; don't-proceed-until-green; `// GUARDS:` convention; honest-summary rule | PM detection tables, audit command lists, security regexes (consolidate into hook scripts — skill invokes them), Playwright setup steps, ASCII output templates |
| visual-check | 103 | ~25 | Always-screenshot-before-presenting trigger; compare against feature spec; report in product terms; max 3 fix loops; MCP-vs-test-runner distinction (one line) | Dev-server discovery procedure, broken-page checklists, screenshot how-to |
| feedback-triage | 91 | ~35 | Priority policy (blocking bugs → bugs → core-flow UX → feature gaps → secondary UX → cosmetic; questions resolved by reading code); confirm-before-working gate; re-triage on mid-stream feedback; quote user's words | Output template, category definitions |
| design-options | 76 | ~45 | 2–3 meaningfully different working variants; dev-only switcher; present neutrally; clean up losers; never more than 3; equal-effort rule | Elaborations and examples |
| check.md / feedback.md | ~15 each | ~3 each | Skill pointer + command-specific behavior (/check: present report before fixing) | Restated skill process (drift risk) |
| CLAUDE.md template | ~90 | ~55 | PM-user section, living-docs rules, security-findings policy, testable-state convention | Setup process (→ vibe-init), "follow codebase patterns" (default behavior), skill-by-skill session choreography that duplicates skill self-descriptions |
| testing.md template | — | — | Structure, coverage map, security config table | Playwright command reference table |

Security regex single-sourcing: the regexes live only in the hook scripts. The
quality-gate skill runs those scripts (via `${CLAUDE_PLUGIN_ROOT}` paths) for its
security phase and interprets the results.

## Migration for existing template-based projects

Existing projects keep working untouched (their `.claude/` is self-contained).
README gets a short migration note: install the plugin, delete the project's
`.claude/skills`, `.claude/hooks`, `.claude/commands` and hook wiring in
settings.json, keep project CLAUDE.md and `docs/`.

## README rewrite

Audience: other PMs/builders discovering the plugin. Covers: what it is, install
commands, quick start (`vibe-init` in an empty directory), what's included
(skills/commands/hooks at current truth — no stale references), Superpowers
companion install, migration note, philosophy (trimmed).

## Error handling

- vibe-init in a non-empty directory with no discovery docs: ask whether to
  proceed (existing-codebase adoption) or stop.
- Superpowers missing: print install commands, pause until installed or user
  opts to continue without.
- Hook scripts must fail open (exit 0) on unexpected errors — never block the
  user's work due to a hook bug — except secret-guard, which keeps its blocking
  behavior for genuine matches.

## Testing plan

1. Install locally: `/plugin marketplace add <local path>` then install; confirm
   skills list as `vibe-os:*` and hooks register.
2. Run vibe-init end-to-end in a scratch directory (interview path and
   docs-provided path); verify generated docs/, CLAUDE.md, and scaffold.
3. Trip each hook deliberately: staged fake AWS key (must block), `npm install`
   of a known-vulnerable package (must warn), `innerHTML` commit (must warn),
   `rm -rf /` style command (must block).
4. Invoke each carried-over skill in a sample project to confirm slimmed
   instructions still produce the expected behavior (triage ordering, mutation
   check, screenshot-before-presenting, option switcher).
5. README accuracy pass: every named skill/hook/command exists.
