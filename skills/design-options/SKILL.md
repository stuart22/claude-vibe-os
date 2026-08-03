---
name: design-options
description: "Activate when a UI or UX decision would be better made by seeing concrete options than by discussing them — redesign requests, dissatisfaction without specific direction ('this feels cluttered'), requests for 'options' or 'alternatives', or when you're about to make a significant visual or layout choice the user hasn't specified. Do NOT activate when the user has given clear direction, or for minor cosmetic tweaks."
---

# Design Options

When the user faces a UI decision, build 2-3 working alternatives so they can choose by looking rather than imagining. This is the antidote to iterating one mediocre design forever.

## Frame the decision first

State what's being decided, the constraints that bound it (screen size, data volume, existing design patterns), and the design principles it should honor — check `docs/ux-direction.md` if the project has one.

## Build real options

Working implementations, not mockups or descriptions. Each option must be:

- **Meaningfully different** — different layout strategies, information hierarchies, or interaction patterns. Not the same design in three colors.
- **Named** for what it does: "Dense data table", "Card grid", "Progressive disclosure".
- **Populated with realistic data**, never lorem ipsum — density problems only show up with real content.
- **Consistent with the app's existing design system.**
- **Equally finished.** A polished option next to a rough one isn't a fair comparison, it's a recommendation in disguise.

Use two options for a straightforward either/or, three when there are genuinely different philosophies in play. Never more than three.

Make them viewable side by side — separate component variants or a route parameter, plus a temporary dev-only switcher — and tell the user how to flip between them.

## Present neutrally

For each option: what it prioritizes, what it trades away, and who it's best for. **Don't advocate.** If the user asks what you'd pick, ground your answer in their UX direction and their users, not your taste.

## Clean up

Once they choose: implement the winner properly, delete the other variants and the switcher, and log the decision in `docs/decisions.md` if it was significant enough to shape future screens.
