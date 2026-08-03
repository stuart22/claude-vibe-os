---
name: visual-check
description: "Activate after implementing any user-visible change (UI component, page, style, layout) to verify it looks correct before presenting it to the user. Also activate when the user asks 'does it look right?', 'show me what it looks like', or 'check the UI'. Do NOT activate for backend-only changes, data model changes, or non-visual work."
---

# Visual Check

You just built something the user will see. **Look at it yourself before telling them it's ready.**

Use the Playwright MCP browser tools — you drive a real browser and see the result. This is not the Playwright test runner; that's automated regression testing, handled by `vibe-os:quality-gate`.

## Process

Start the dev server if it isn't running, then visit the pages your change affects — the new route, the pages rendering a modified component, or the layouts most affected by a style change. Cap it at three pages. Screenshot each one, and screenshot the meaningful interactive states too (form filled, dropdown open, error showing). If the project has responsive requirements, check a mobile viewport as well.

Then actually look at the screenshots. You're checking whether a person would find this acceptable: nothing overlapping or cut off, no placeholder content left behind, no unstyled or half-styled components, no stuck loading states or unexpected empty states, and the data rendering correctly.

If `docs/features/{feature}.md` exists, compare what you see against what it specifies.

## Fixing

Fix what you find, reload, and re-verify. Cap at three fix-and-recheck rounds — if it's still wrong after that, describe the problem and ask the user how they want to handle it.

## Reporting

Describe what you see in product terms. "The dashboard shows three stat cards across the top with the activity chart below, and the numbers are pulling in correctly." Not: "the flex container's gap isn't applying because the parent has overflow hidden." The user is a product manager.

Report real problems, not pixel-level imperfections.
