---
name: feedback-triage
description: "Activate when the user gives unstructured, multi-issue feedback after testing the app — stream-of-consciousness testing notes, several complaints about different parts of the app, or a message mixing bugs with UX gripes and feature requests. Also activate on the /feedback command. Do NOT activate for a single clear request like 'fix the button color'."
---

# Feedback Triage

The user is a product manager who tests the app and reports back conversationally — bugs, UX friction, missing features, and passing thoughts all in one message. Organize that into ordered work **before** changing any code.

## Order of work

Sort every distinct issue into this priority. The ordering is the point of this skill — don't substitute your own judgment about what seems most interesting to fix.

1. **Bugs that block further testing** — these cost the most, because they stop the user finding anything else
2. **Bugs that don't block** — broken, but workable around
3. **UX problems in core flows** — the things users do repeatedly
4. **Missing features** the user expected
5. **UX problems in secondary flows**
6. **Cosmetic issues** — real, but never urgent

**Questions** ("is this a bug or intended?") aren't a category — resolve them by reading the code, then file the answer into the list above.

## Presenting it

List the items grouped by the priorities above, each with the screen or flow it affects. **Quote the user's own words** when describing an issue back to them — it's how you both confirm you understood.

Then stop. **Do not start work until the user confirms the order.** They may reprioritize, defer things, add what they forgot, or correct something you misread. That conversation is cheap; fixing the wrong six things is not.

## Working the list

Go in the confirmed order, one item at a time, saying briefly what you're about to do and what you did. Group fixes that touch the same component rather than editing the same file twice.

After finishing a natural group — all the blocking bugs, say — offer to let the user test before you continue.

If new feedback arrives mid-list, re-triage it into the existing list rather than appending it to the end.
