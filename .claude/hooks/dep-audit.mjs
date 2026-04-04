#!/usr/bin/env node

/**
 * dep-audit.mjs — PostToolUse hook (Bash matcher)
 *
 * After dependency install commands, runs the appropriate audit tool
 * and surfaces critical/high vulnerabilities as warnings.
 * Always exits 0 (warn, never block).
 */

import { execSync } from 'child_process';

const INSTALL_PATTERNS = [
  { pattern: /\bnpm\s+(install|i|add|ci)\b/, audit: 'npm audit --json 2>/dev/null', parser: parseNpmAudit },
  { pattern: /\byarn\s+add\b/, audit: 'yarn audit --json 2>/dev/null', parser: parseYarnAudit },
  { pattern: /\bpnpm\s+(install|i|add)\b/, audit: 'pnpm audit --json 2>/dev/null', parser: parseNpmAudit },
  { pattern: /\bpip\s+install\b/, audit: 'pip audit --format=json 2>/dev/null', parser: parsePipAudit },
  { pattern: /\bcargo\s+(add|install)\b/, audit: 'cargo audit --json 2>/dev/null', parser: parseCargoAudit },
];

function parseNpmAudit(output) {
  try {
    const data = JSON.parse(output);
    const vulns = data.vulnerabilities || {};
    const critical = Object.values(vulns).filter(v => v.severity === 'critical');
    const high = Object.values(vulns).filter(v => v.severity === 'high');
    return { critical: critical.length, high: high.length, packages: [...critical, ...high].map(v => v.name).filter(Boolean) };
  } catch {
    return null;
  }
}

function parseYarnAudit(output) {
  // Yarn audit --json outputs newline-delimited JSON
  try {
    const lines = output.trim().split('\n').map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const advisories = lines.filter(l => l.type === 'auditAdvisory').map(l => l.data?.advisory).filter(Boolean);
    const critical = advisories.filter(a => a.severity === 'critical');
    const high = advisories.filter(a => a.severity === 'high');
    return { critical: critical.length, high: high.length, packages: [...critical, ...high].map(a => a.module_name).filter(Boolean) };
  } catch {
    return null;
  }
}

function parsePipAudit(output) {
  try {
    const data = JSON.parse(output);
    // pip audit --format=json returns an array of vulnerabilities
    const vulns = Array.isArray(data) ? data : data.vulnerabilities || [];
    return { critical: 0, high: vulns.length, packages: vulns.map(v => v.name).filter(Boolean) };
  } catch {
    return null;
  }
}

function parseCargoAudit(output) {
  try {
    const data = JSON.parse(output);
    const vulns = data.vulnerabilities?.list || [];
    return { critical: 0, high: vulns.length, packages: vulns.map(v => v.advisory?.package).filter(Boolean) };
  } catch {
    return null;
  }
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const command = data.tool_input?.command || '';

  // Find matching install pattern
  const match = INSTALL_PATTERNS.find(p => p.pattern.test(command));
  if (!match) {
    process.exit(0);
  }

  let auditOutput = '';
  try {
    auditOutput = execSync(match.audit, { encoding: 'utf-8', timeout: 30000 });
  } catch (err) {
    // Some audit commands exit non-zero when vulnerabilities are found
    auditOutput = err.stdout || '';
    if (!auditOutput) {
      process.exit(0); // Audit tool not available or failed
    }
  }

  const result = match.parser(auditOutput);
  if (!result || (result.critical === 0 && result.high === 0)) {
    process.exit(0);
  }

  const parts = [];
  if (result.critical > 0) parts.push(`${result.critical} critical`);
  if (result.high > 0) parts.push(`${result.high} high`);

  console.log(
    `\n⚠️  DEPENDENCY AUDIT WARNING: ${parts.join(', ')} severity vulnerabilities found` +
    (result.packages.length > 0 ? `\n   Affected: ${[...new Set(result.packages)].join(', ')}` : '') +
    `\n   Run the audit command for details and consider running the fix command.\n`
  );

  process.exit(0);
}

main().catch(() => process.exit(0));
