#!/usr/bin/env node

/**
 * StatusLine Context Monitor
 * 
 * Displays context window usage in the Claude Code status bar and triggers
 * state-save reminders at configurable thresholds.
 * 
 * Receives JSON on stdin with context_window.used_percentage on each tick.
 * Outputs formatted status line to stdout.
 * 
 * Thresholds:
 *   75% — Gentle reminder to update current-focus.md
 *   85% — Urgent: save state now, wrap up current task
 *   95% — Critical: compaction imminent, emergency state save
 */

import { readFileSync } from 'fs';

// Read JSON from stdin
const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'));

const contextPercent = input?.context_window?.used_percentage ?? 0;
const model = input?.model ?? 'unknown';
const gitBranch = input?.git?.branch ?? '';
const costUsd = input?.cost?.total_usd ?? 0;

// Determine status indicator
let contextIndicator;
let contextMessage = '';

if (contextPercent >= 95) {
  contextIndicator = '🔴';
  contextMessage = ' ⚠ COMPACTION IMMINENT — save state NOW';
} else if (contextPercent >= 85) {
  contextIndicator = '🟠';
  contextMessage = ' → Wrap up and save to current-focus.md';
} else if (contextPercent >= 75) {
  contextIndicator = '🟡';
  contextMessage = ' → Consider saving state';
} else {
  contextIndicator = '🟢';
}

// Format cost
const costDisplay = costUsd > 0 ? ` | $${costUsd.toFixed(2)}` : '';

// Format branch
const branchDisplay = gitBranch ? ` | ${gitBranch}` : '';

// Output status line
const statusLine = `${contextIndicator} ${contextPercent}%${contextMessage}${branchDisplay}${costDisplay}`;

process.stdout.write(statusLine);
