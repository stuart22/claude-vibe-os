#!/usr/bin/env node

/**
 * Pre-Compact Backup Hook
 * 
 * Fires right before context compaction. Creates a structured backup of the
 * current session state so the session-reinject hook can restore critical
 * context after compaction.
 * 
 * Strategy:
 *   1. Capture recent git activity (what files changed, recent commits)
 *   2. Read current-focus.md if it exists
 *   3. Snapshot open questions and in-progress work
 *   4. Write everything to .claude/backups/pre-compact-{timestamp}.md
 * 
 * This hook outputs text to stdout which gets injected into Claude's context
 * as a final message before compaction. Use this to tell Claude to save state.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const backupDir = join(process.cwd(), '.claude', 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = join(backupDir, `pre-compact-${timestamp}.md`);

// Ensure backup directory exists
mkdirSync(backupDir, { recursive: true });

let backup = `# Pre-Compaction Backup\n`;
backup += `**Timestamp:** ${new Date().toISOString()}\n\n`;

// Capture recent git history
try {
  const recentCommits = execSync('git log --oneline -10 2>/dev/null', { encoding: 'utf8' });
  backup += `## Recent Commits\n\`\`\`\n${recentCommits}\`\`\`\n\n`;
} catch {
  backup += `## Recent Commits\nNo git history available.\n\n`;
}

// Capture modified files
try {
  const modifiedFiles = execSync('git diff --name-only HEAD 2>/dev/null', { encoding: 'utf8' });
  if (modifiedFiles.trim()) {
    backup += `## Uncommitted Changes\n\`\`\`\n${modifiedFiles}\`\`\`\n\n`;
  }
  
  const stagedFiles = execSync('git diff --name-only --cached 2>/dev/null', { encoding: 'utf8' });
  if (stagedFiles.trim()) {
    backup += `## Staged Files\n\`\`\`\n${stagedFiles}\`\`\`\n\n`;
  }
} catch {
  // No git or no changes — fine
}

// Include current-focus.md if it exists
const focusPath = join(process.cwd(), '.claude', 'current-focus.md');
if (existsSync(focusPath)) {
  const focusContent = readFileSync(focusPath, 'utf8');
  backup += `## Current Focus (at time of compaction)\n${focusContent}\n\n`;
}

// Include recent decisions
const decisionsPath = join(process.cwd(), 'docs', 'decisions.md');
if (existsSync(decisionsPath)) {
  const decisionsContent = readFileSync(decisionsPath, 'utf8');
  // Get last ~50 lines (most recent decisions)
  const recentDecisions = decisionsContent.split('\n').slice(-50).join('\n');
  backup += `## Recent Decisions\n${recentDecisions}\n\n`;
}

// Write backup
writeFileSync(backupPath, backup);

// Output instruction to Claude (injected into context before compaction)
const output = [
  `⚠️ COMPACTION IMMINENT — A backup has been saved to ${backupPath}.`,
  `Update .claude/current-focus.md NOW with:`,
  `- What you just completed`,
  `- What you were in the middle of`,
  `- Any open questions or decisions pending`,
  `- Key context that would be lost in a summary`
].join('\n');

process.stdout.write(output);
