---
name: context-recovery
description: "Activate this skill immediately after context compaction occurs, when you detect that your context has been summarized and you may have lost detailed information about the current session's work. Also activate when the session-reinject hook provides context recovery instructions, or when the user says something like 'we were just working on...' and you don't have full context of what was happening."
---

# Context Recovery

## Purpose

After context compaction, you lose precision — specific error messages, exact code you were editing, the reasoning behind recent decisions, and the flow of the current task. This skill tells you how to recover effectively so the user doesn't have to re-explain everything.

## Recognizing compaction

You've been compacted if:
- Your earliest memory of this session is a summary rather than a specific exchange
- You have general awareness of what you were working on but lack specifics
- The session-reinject hook has just provided you with recovery context
- The user tells you "we were just working on X" and you can't recall the details

## Recovery process

### Step 1: Read the recovery files

Read these files in this order:

1. **`.claude/current-focus.md`** — This is your primary recovery source. It should contain what was just completed, what's in progress, open questions, and next steps.
2. **`CLAUDE.md`** — Re-read the full project context. Even though CLAUDE.md survives compaction automatically, re-reading it deliberately helps you reconnect with project conventions.
3. **`docs/decisions.md`** — Scan recent entries (last 5-10) for decisions relevant to current work.
4. **`.claude/backups/`** — If a pre-compaction backup exists (created by the pre-compact hook), read it for additional detail the summary may have lost.

### Step 2: Assess what you know vs. don't know

After reading the recovery files, briefly assess:
- **What you're confident about** (project architecture, conventions, what feature you were working on)
- **What you're uncertain about** (exact state of the code you were editing, specific errors encountered, where exactly in a multi-step task you were)

### Step 3: Re-read relevant source files

Based on `current-focus.md`, re-read the actual source files you were working on. Don't assume you remember the code — look at it fresh. This is critical because compaction often preserves the *idea* of what you were doing but loses the *specifics* of the code state.

### Step 4: Resume or ask

If recovery files give you enough context to continue confidently:
- Briefly tell the user what you understand the current state to be
- Continue working

If you're uncertain about something important:
- Tell the user specifically what you're unsure about
- Don't ask vague questions like "what were we doing?" — ask specific ones like "I can see we were implementing the draft system. I'm picking up from the player card component. Was there a specific sorting issue we were addressing?"

## Important behaviors

- **Never pretend you have full context when you don't.** It's better to ask one specific question than to proceed on wrong assumptions and waste the user's time.
- **Don't re-read everything from scratch.** Use the recovery files to be surgical about what you re-read. Context window space is precious, especially right after compaction freed some up.
- **Update current-focus.md more frequently after a compaction.** Your safety margin is reset — treat the post-compaction session as having a shorter effective window and save state more aggressively.
- **If there's no current-focus.md or it's stale**, use `git log --oneline -10` and `git diff HEAD~3` to reconstruct what was recently changed. This is your fallback recovery source.
- **Check for a pre-compaction backup** in `.claude/backups/`. The pre-compact hook may have created a structured snapshot that has more detail than what's in current-focus.md.
