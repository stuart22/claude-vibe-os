#!/usr/bin/env node

/**
 * code-scan.mjs — PreToolUse hook (Bash matcher)
 *
 * Before git commit, scans staged changes for common code vulnerability patterns.
 * Always exits 0 (warn, never block).
 */

import { execSync } from 'child_process';

const VULNERABILITY_PATTERNS = [
  {
    name: 'Unsafe innerHTML assignment',
    pattern: /\.innerHTML\s*=/,
    severity: 'warning',
    advice: 'Use textContent or a sanitization library instead of raw innerHTML.',
  },
  {
    name: 'dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML/,
    severity: 'warning',
    advice: 'Ensure the content is sanitized before rendering. Consider using a library like DOMPurify.',
  },
  {
    name: 'eval() usage',
    pattern: /\beval\s*\(/,
    severity: 'warning',
    advice: 'eval() can execute arbitrary code. Use JSON.parse() for data or safer alternatives.',
  },
  {
    name: 'new Function() constructor',
    pattern: /new\s+Function\s*\(/,
    severity: 'warning',
    advice: 'new Function() is equivalent to eval(). Find a safer alternative.',
  },
  {
    name: 'Shell command injection risk',
    pattern: /child_process\.(exec|execSync)\s*\(\s*(`|['"][^'"]*\$\{)/,
    severity: 'warning',
    advice: 'Use execFile/execFileSync with argument arrays instead of exec with string interpolation.',
  },
  {
    name: 'SQL injection risk',
    pattern: /(SELECT|INSERT|UPDATE|DELETE)\s+.*(\$\{|['"\s]*\+\s*\w)/i,
    severity: 'warning',
    advice: 'Use parameterized queries or an ORM instead of string concatenation in SQL.',
  },
  {
    name: 'Hardcoded HTTP URL (not HTTPS)',
    pattern: /["']http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/,
    severity: 'info',
    advice: 'Use HTTPS for external URLs to prevent man-in-the-middle attacks.',
  },
  {
    name: 'Overly permissive CORS',
    pattern: /origin:\s*['"]?\*['"]?|Access-Control-Allow-Origin.*\*/,
    severity: 'warning',
    advice: 'Restrict CORS to specific origins instead of allowing all (*) in production.',
  },
];

// Files to skip scanning (tests, configs, lock files)
const SKIP_FILE_PATTERNS = [
  /\.(test|spec|e2e)\.[jt]sx?$/,
  /__(tests|mocks)__\//,
  /\.config\.[jt]s$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const command = data.tool_input?.command || '';

  // Only intercept git commit commands
  if (!/\bgit\s+commit\b/.test(command)) {
    process.exit(0);
  }

  let stagedDiff = '';
  let stagedFiles = '';
  try {
    stagedDiff = execSync('git diff --cached', { encoding: 'utf-8', timeout: 10000 });
    stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8', timeout: 10000 });
  } catch {
    process.exit(0);
  }

  // Filter out files we don't want to scan
  const filesToScan = stagedFiles.split('\n').filter(f => {
    const trimmed = f.trim();
    if (!trimmed) return false;
    return !SKIP_FILE_PATTERNS.some(p => p.test(trimmed));
  });

  if (filesToScan.length === 0) {
    process.exit(0);
  }

  // Only scan added lines in the diff
  const addedLines = stagedDiff
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'));

  const findings = [];
  for (const { name, pattern, severity, advice } of VULNERABILITY_PATTERNS) {
    const matchingLines = addedLines.filter(line => pattern.test(line));
    if (matchingLines.length > 0) {
      findings.push({ name, severity, advice, count: matchingLines.length });
    }
  }

  if (findings.length === 0) {
    process.exit(0);
  }

  const warnings = findings.filter(f => f.severity === 'warning');
  const infos = findings.filter(f => f.severity === 'info');

  let message = `\n🔍 CODE SECURITY SCAN: ${findings.length} potential issue${findings.length === 1 ? '' : 's'} found in staged changes\n`;

  if (warnings.length > 0) {
    message += '\n  Warnings:\n';
    for (const f of warnings) {
      message += `    ⚠️  ${f.name}${f.count > 1 ? ` (${f.count} occurrences)` : ''}\n`;
      message += `       ${f.advice}\n`;
    }
  }

  if (infos.length > 0) {
    message += '\n  Info:\n';
    for (const f of infos) {
      message += `    ℹ️  ${f.name}${f.count > 1 ? ` (${f.count} occurrences)` : ''}\n`;
      message += `       ${f.advice}\n`;
    }
  }

  message += '\n  Review these patterns and address any genuine security concerns before committing.\n';

  console.log(message);
  process.exit(0);
}

main().catch(() => process.exit(0));
