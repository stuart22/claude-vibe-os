#!/usr/bin/env node

/**
 * secret-guard.mjs — PreToolUse hook (Bash matcher)
 *
 * Hard-blocks git commit/add when staged changes contain secret patterns.
 * Exit 2 = block the tool use. Exit 0 = allow.
 */

import { execSync } from 'child_process';

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key', pattern: /-----BEGIN[A-Z ]*PRIVATE KEY-----/ },
  { name: 'Generic Secret', pattern: /(API_KEY|API_SECRET|SECRET_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY)\s*[=:]\s*["']?\S{8,}/i },
  { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const command = data.tool_input?.command || '';

  // Only intercept git commit and git add commands
  if (!/\bgit\s+(commit|add)\b/.test(command)) {
    process.exit(0);
  }

  let stagedDiff = '';
  let stagedFiles = '';
  try {
    stagedDiff = execSync('git diff --cached', { encoding: 'utf-8', timeout: 10000 });
    stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8', timeout: 10000 });
  } catch {
    // If git commands fail (e.g., no repo), allow the command through
    process.exit(0);
  }

  const findings = [];

  // Check for .env files being staged
  const envFiles = stagedFiles.split('\n').filter(f => /^\.env(\..+)?$/.test(f.trim()) || f.trim().endsWith('.env'));
  if (envFiles.length > 0) {
    findings.push(`  .env file staged: ${envFiles.join(', ')}`);
  }

  // Scan diff content for secret patterns (only added lines)
  const addedLines = stagedDiff
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'));

  for (const { name, pattern } of SECRET_PATTERNS) {
    for (const line of addedLines) {
      if (pattern.test(line)) {
        // Show a truncated version of the match to help identify it
        const match = line.substring(1, 80); // Remove leading '+', truncate
        findings.push(`  ${name}: ...${match}${line.length > 81 ? '...' : ''}`);
        break; // One finding per pattern is enough
      }
    }
  }

  if (findings.length > 0) {
    process.stderr.write(
      `BLOCKED: Possible secrets detected in staged changes:\n\n` +
      findings.join('\n') +
      `\n\nTo fix:\n` +
      `  - Remove the secret from the file, or\n` +
      `  - Use git reset HEAD <file> to unstage, or\n` +
      `  - Add the file to .gitignore\n`
    );
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
