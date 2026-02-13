---
name: design-options
description: "Activate this skill when the user needs to make a UI or UX design decision and would benefit from seeing concrete options rather than discussing abstractly. Triggers include: requests to redesign or rework a screen or component, dissatisfaction with how something looks or feels ('this feels cluttered', 'this isn't right'), requests for 'options' or 'alternatives' for a UI element, the /design-options command, or when you're about to make a significant visual or layout change and the user hasn't specified exactly what they want."
---

# Design Options

## Purpose

When the user faces a UI or UX decision, generate 2-3 working prototypes with distinct approaches so they can compare and choose. This avoids the "iterate one thing endlessly" trap — instead, the user sees concrete alternatives and picks a direction.

## When to activate

- The user expresses dissatisfaction with a UI element without specifying exactly what they want instead
- A feature implementation requires a significant layout or interaction pattern decision
- The user asks "what are my options for..." or "how should we handle..."
- You're about to build something with multiple reasonable UI approaches
- The user explicitly requests options or alternatives

## When NOT to activate

- The user has given specific, clear UI direction ("make the header blue", "add a sidebar nav")
- The change is minor or cosmetic (spacing, font size tweaks)
- The decision is functional, not visual (data model, API structure)

## Process

### Step 1: Frame the decision

Before generating anything, briefly state:
- **What's being decided** (e.g., "how to display player stats on the roster page")
- **The constraints** (screen size, data volume, existing design patterns in the app)
- **The UX direction** (reference `docs/ux-direction.md` if it exists — the design principles should guide your options)

### Step 2: Generate 2-3 distinct approaches

Create working implementations — not mockups, not descriptions, but actual code you can run and see. Each approach should be:

- **Meaningfully different** — not just variations in color or spacing, but different layout strategies, information hierarchies, or interaction patterns
- **Labeled clearly** — give each a short descriptive name (e.g., "Dense data table", "Card-based layout", "Progressive disclosure panels")
- **Functional** — each should work with real or realistic data, not placeholder lorem ipsum
- **Consistent with existing design** — respect the app's existing design system, colors, typography

**Implementation approach:**
- Create each option as a variant that can be toggled or viewed separately
- If the component is isolated enough, create separate component files (e.g., `RosterView-A.tsx`, `RosterView-B.tsx`, `RosterView-C.tsx`)
- If it's a full page layout, use a simple toggle or route parameter to switch between them
- Add a temporary dev-only switcher UI so the user can flip between options easily

### Step 3: Present the options

For each option, explain in 2-3 sentences:
- **What this approach prioritizes** (e.g., "prioritizes data density — you see all stats at once")
- **The tradeoff** (e.g., "but it's visually busy and may overwhelm new users")
- **When this approach works best** (e.g., "best if your primary users are power users who want everything visible")

Then tell the user how to view and switch between the options (dev server URL, toggle mechanism, etc.).

### Step 4: Let the user choose

**Do not advocate for an option.** Present them neutrally and let the user decide based on their product vision. If asked for your recommendation, you can share one, but frame it in terms of the UX direction document and the target users, not personal preference.

### Step 5: Clean up

After the user chooses:
- Implement the chosen approach as the actual component
- Remove the other variants and the switcher UI
- Delete the temporary files
- If the decision was significant, log it in `docs/decisions.md` (e.g., "Chose card-based layout for roster view because it better supports scanning by position group")

## Scope guidance

- **2 options** for straightforward decisions (layout A vs B)
- **3 options** for complex decisions where there are genuinely different philosophies
- **Never more than 3** — choice overload defeats the purpose
- Each option should take roughly the same effort to build — don't make one polished and the others rough, as that biases the decision
