#!/usr/bin/env node

/**
 * code-scan.mjs — PreToolUse hook (Bash matcher)
 *
 * Warns about dangerous code patterns in staged changes before a commit.
 * Always exits 0 — this warns, it never blocks.
 */

import {
  readHookInput, sh, addedLines, isScannableFile,
  findVulnerabilities, formatVulnerabilities,
} from './patterns.mjs';

async function main() {
  const { tool_input } = await readHookInput();
  const command = tool_input?.command || '';

  if (!/\bgit\s+commit\b/.test(command)) process.exit(0);

  const files = sh('git diff --cached --name-only').split('\n').filter(isScannableFile);
  if (!files.length) process.exit(0);

  const diff = sh(`git diff --cached -- ${files.map(f => JSON.stringify(f)).join(' ')}`);
  const findings = findVulnerabilities(addedLines(diff));
  if (!findings.length) process.exit(0);

  console.log(
    `\n🔍 Code security scan: ${findings.length} potential issue${findings.length === 1 ? '' : 's'} in staged changes\n` +
    formatVulnerabilities(findings) +
    '\n  Review these before committing.\n'
  );
  process.exit(0);
}

main().catch(() => process.exit(0));
