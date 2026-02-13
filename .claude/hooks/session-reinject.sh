#!/bin/bash

# Session Reinject Hook
#
# Fires on SessionStart with "compact" matcher — meaning it only runs after
# context compaction, not on fresh session starts.
#
# Reads recovery files and outputs critical context to stdout, which gets
# injected into Claude's context window after compaction.

echo "🔄 SESSION RECOVERED AFTER COMPACTION"
echo ""

# Reinject current-focus.md (primary recovery source)
FOCUS_FILE=".claude/current-focus.md"
if [ -f "$FOCUS_FILE" ]; then
  echo "## Current Focus"
  cat "$FOCUS_FILE"
  echo ""
else
  echo "⚠️ No current-focus.md found. Use git log and source files to reconstruct state."
  echo ""
fi

# Show recent git activity for additional context
echo "## Recent Git Activity"
git log --oneline -5 2>/dev/null || echo "No git history available"
echo ""

# Show any uncommitted work
UNCOMMITTED=$(git diff --name-only HEAD 2>/dev/null)
if [ -n "$UNCOMMITTED" ]; then
  echo "## Uncommitted Files"
  echo "$UNCOMMITTED"
  echo ""
fi

# Check for pre-compact backup
LATEST_BACKUP=$(ls -t .claude/backups/pre-compact-*.md 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  echo "## Pre-Compaction Backup Available"
  echo "A detailed backup was saved at: $LATEST_BACKUP"
  echo "Read this file if current-focus.md doesn't have enough detail."
  echo ""
fi

echo "---"
echo "INSTRUCTIONS: Read the context above, re-read relevant source files,"
echo "and resume work. If anything is unclear, ask the user specifically"
echo "what you're unsure about — don't guess."
