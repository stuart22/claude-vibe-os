#!/usr/bin/env node

/**
 * StatusLine Context Monitor
 *
 * Displays context window usage in the Claude Code status bar.
 * Receives JSON on stdin with context_window.used_percentage on each tick.
 * Outputs formatted status line to stdout.
 */

import { readFileSync } from 'fs';

// Read JSON from stdin
const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'));

const contextPercent = input?.context_window?.used_percentage ?? 0;
const gitBranch = input?.git?.branch ?? '';
const costUsd = input?.cost?.total_usd ?? 0;

// Determine status indicator
let contextIndicator;
if (contextPercent >= 90) {
  contextIndicator = '🔴';
} else if (contextPercent >= 75) {
  contextIndicator = '🟡';
} else {
  contextIndicator = '🟢';
}

// Format cost
const costDisplay = costUsd > 0 ? ` | $${costUsd.toFixed(2)}` : '';

// Format branch
const branchDisplay = gitBranch ? ` | ${gitBranch}` : '';

// Output status line
const statusLine = `${contextIndicator} ${contextPercent}%${branchDisplay}${costDisplay}`;

process.stdout.write(statusLine);
