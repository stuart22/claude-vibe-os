---
name: feedback-triage
description: "Activate this skill when the user provides unstructured, multi-issue feedback after testing the application. Triggers include: stream-of-consciousness testing notes, messages containing multiple complaints or observations about different parts of the app, messages that mix bugs with UX feedback with feature requests, or when the user explicitly uses the /feedback command. Do NOT activate for single, clear requests like 'fix the button color' or 'add a search bar.'"
---

# Feedback Triage

## Purpose

The user is a product manager who tests the running application and provides feedback conversationally — often as a stream of unstructured observations mixing bugs, UX issues, feature gaps, and general impressions. This skill organizes that raw input into actionable work before any code changes begin.

## When to activate

- The user's message contains 3+ distinct observations or issues
- The message mixes different types of feedback (bugs, UX, features, questions)
- The tone is conversational/informal rather than a specific technical request
- The user says something like "so I was testing and..." followed by multiple points
- The `/feedback` command is used

## Process

### Step 1: Parse and categorize

Read the user's raw feedback carefully. Extract every distinct issue and categorize each one:

- **Bug** — Something is broken or behaving incorrectly (not working as specified)
- **UX issue** — Something works but feels wrong, confusing, or unpolished
- **Feature gap** — Something is missing that the user expected or needs
- **Question** — The user isn't sure if something is a bug or intended behavior
- **Cosmetic** — Visual polish items (spacing, colors, typography)

### Step 2: Prioritize

Order the issues by this priority:

1. **Bugs that block testing other things** (highest — these prevent further feedback)
2. **Bugs that don't block** (broken behavior the user can work around)
3. **UX issues that affect core flows** (the main things users do repeatedly)
4. **Feature gaps** (missing functionality)
5. **UX issues on secondary flows** (less-trafficked areas)
6. **Cosmetic issues** (lowest — important but not urgent)
7. **Questions** (resolve these by checking the code, then reclassify)

### Step 3: Present the triage summary

Present the organized list to the user in this format:

```
I found [N] items in your feedback. Here's how I'd prioritize them:

**Bugs (blocking)**
1. [Brief description] — [which screen/flow]

**Bugs (non-blocking)**
2. [Brief description] — [which screen/flow]

**UX Issues**
3. [Brief description] — [which screen/flow]
4. [Brief description] — [which screen/flow]

**Feature Gaps**
5. [Brief description]

**Cosmetic**
6. [Brief description]

Want me to tackle them in this order, or would you like to reprioritize?
```

### Step 4: Get confirmation

**Do not start working until the user confirms the order.** They may want to:
- Reprioritize (e.g., "actually do #4 first, the core loop UX matters more")
- Defer items (e.g., "skip the cosmetic stuff for now")
- Add items they forgot
- Clarify items you may have misunderstood

### Step 5: Execute sequentially

Once confirmed, work through the list one at a time:
- Before each item, briefly state what you're about to do
- After each item, briefly state what you did
- After completing a natural group (e.g., all bugs), ask if the user wants to test before continuing
- Save progress to a project memory if the list is long and spans multiple steps

## Important notes

- **Never skip the triage step.** Even if the feedback seems clear, organizing it first prevents you from fixing one thing while breaking another, or spending time on cosmetic issues when there's a blocking bug.
- **Quote the user's own words** when describing each issue back to them — this confirms you understood correctly.
- **If the user provides additional feedback mid-execution**, pause and re-triage the new items into the existing list rather than just appending them.
- **Group related fixes** when possible. If two UX issues affect the same component, fix them together rather than touching the same file twice.
