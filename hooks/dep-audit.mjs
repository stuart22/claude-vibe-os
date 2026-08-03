#!/usr/bin/env node

/**
 * dep-audit.mjs — PostToolUse hook (Bash matcher)
 *
 * After a dependency install, runs the matching audit tool and surfaces
 * critical/high vulnerabilities. Always exits 0 — this warns, it never blocks.
 */

import { readHookInput, sh, INSTALL_PATTERNS } from './patterns.mjs';

async function main() {
  const { tool_input } = await readHookInput();
  const command = tool_input?.command || '';

  const match = INSTALL_PATTERNS.find(p => p.pattern.test(command));
  if (!match) process.exit(0);

  const output = sh(match.audit, 30000);
  if (!output) process.exit(0);

  const result = match.parser(output);
  if (!result || (result.critical === 0 && result.high === 0)) process.exit(0);

  const counts = [
    result.critical > 0 ? `${result.critical} critical` : null,
    result.high > 0 ? `${result.high} high` : null,
  ].filter(Boolean).join(', ');

  const affected = [...new Set(result.packages)];

  console.log(
    `\n⚠️  Dependency audit: ${counts} severity ${affected.length === 1 ? 'vulnerability' : 'vulnerabilities'} found` +
    (affected.length ? `\n   Affected: ${affected.join(', ')}` : '') +
    '\n   Run the audit command for details.\n'
  );
  process.exit(0);
}

main().catch(() => process.exit(0));
