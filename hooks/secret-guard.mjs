#!/usr/bin/env node

/**
 * secret-guard.mjs — PreToolUse hook (Bash matcher)
 *
 * Blocks `git commit` / `git add` when staged changes contain secrets.
 * Exit 2 blocks the tool call; exit 0 allows it. Fails open on any error.
 */

import { readHookInput, sh, addedLines, findSecrets } from './patterns.mjs';

async function main() {
  const { tool_input } = await readHookInput();
  const command = tool_input?.command || '';

  if (!/\bgit\s+(commit|add)\b/.test(command)) process.exit(0);

  const diff = sh('git diff --cached');
  const files = sh('git diff --cached --name-only').split('\n');
  if (!diff && !files.some(Boolean)) process.exit(0);

  const findings = findSecrets(addedLines(diff), files);
  if (!findings.length) process.exit(0);

  process.stderr.write(
    'BLOCKED: possible secrets in staged changes:\n\n' +
    findings.map(f => `  ${f}`).join('\n') +
    '\n\nFix by removing the secret, unstaging the file (git reset HEAD <file>), ' +
    'or adding it to .gitignore.\n'
  );
  process.exit(2);
}

main().catch(() => process.exit(0));
