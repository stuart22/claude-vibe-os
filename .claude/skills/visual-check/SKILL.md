---
name: visual-check
description: "Activate this skill after implementing any user-visible change (UI component, page, style, layout) to verify it looks correct before presenting to the user. Also activate when the user asks 'does it look right?', 'show me what it looks like', or 'check the UI'. Do NOT activate for backend-only changes, data model changes, or non-visual work."
---

# Visual Check

## Purpose

You just built something the user will see. Before telling them it's ready, **look at it yourself**. This skill uses the Playwright MCP browser tools to take a screenshot and evaluate whether the UI actually looks correct — catching layout bugs, missing content, and broken styling before the PM ever sees it.

## Key Distinction

This skill uses the **Playwright MCP plugin** (you drive a real browser and see screenshots). This is NOT the Playwright test runner (`@playwright/test`). The MCP plugin is for your eyes during development. The test runner is for automated regression tests (handled by the `quality-gate` skill).

## Process

### Step 1: Ensure the dev server is running

Check if the dev server is already running. If not:
1. Read `package.json` and look for scripts: `dev`, `start`, `serve` (in that order of preference)
2. Start the server in the background using the appropriate command (e.g., `npm run dev &`)
3. Wait for it to be ready (check for the port being available)
4. Note the URL (typically `http://localhost:3000`, `http://localhost:5173`, or similar)

If there's no `package.json` or no recognizable dev server script, ask the user how to run the project.

### Step 2: Identify what to check

Based on the changes you just made:
- If you **added a new page/route**: visit that page directly
- If you **modified a component**: visit the page(s) that render it
- If you **changed styles/layout**: visit the most affected pages
- If **multiple pages** were affected: check each one (up to 3 pages)

If you're unsure which URL to visit, check the project's routing configuration.

### Step 3: Navigate and screenshot

For each URL to check:
1. Use `browser_navigate` to load the page
2. Wait for the page to be ready (network idle or visible content)
3. Use `browser_take_screenshot` to capture the full page
4. If the page has interactive states (e.g., a form, a dropdown), interact with key elements and screenshot those states too

### Step 4: Evaluate what you see

Look at each screenshot critically. Check for:

**Layout issues:**
- Elements overlapping or cut off
- Unexpected gaps or spacing
- Content not centered or aligned as expected
- Responsive issues (if you can resize the viewport)

**Content issues:**
- Missing text, images, or data
- Placeholder content still showing ("Lorem ipsum", "TODO", etc.)
- Incorrect data or labels

**Style issues:**
- Unstyled components (raw HTML appearance)
- Inconsistent fonts, colors, or spacing compared to the rest of the app
- Dark/light mode issues

**Functionality indicators:**
- Error states visible (red borders, error messages)
- Loading states stuck
- Empty states where there should be content

### Step 5: Report to the user

Describe what you see **in product terms** (not code terms):

**Good:** "The dashboard is showing the three stats cards across the top, with the activity chart below. The numbers are pulling in correctly and the layout looks clean."

**Bad (found issues):** "The dashboard cards are rendering, but the chart is overlapping the footer on smaller viewports. Let me fix that."

Do NOT say: "The flexbox container's `gap` property isn't being applied because the parent div has `overflow: hidden`." The user is a PM — describe what's wrong visually.

### Step 6: Fix and re-check

If you found issues:
1. Fix the issue in the code
2. Reload the page and take a new screenshot
3. Verify the fix worked
4. Repeat if needed (max 3 fix-and-check iterations)

If you can't fix the issue after 3 attempts, describe it to the user and ask for guidance.

## When to skip

- **Backend-only changes** (API endpoints, database queries, business logic) — nothing visual to check
- **Configuration changes** (environment variables, build config) — no visual impact
- **Test files only** — tests don't have visual output
- **Documentation changes** — nothing to render

## Important notes

- **Always screenshot before reporting.** Don't guess that the UI looks right — verify it.
- **Check the feature spec.** If `docs/features/{feature}.md` exists, compare what you see against what's specified.
- **Mobile matters.** If the project has responsive requirements, check at a mobile viewport too (use `browser_evaluate` to resize if needed).
- **Don't over-report.** Focus on real problems, not minor pixel differences. The PM wants to know if it works, not if every pixel is perfect.
