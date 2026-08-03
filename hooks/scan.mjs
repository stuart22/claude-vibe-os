#!/usr/bin/env node

/**
 * scan.mjs — on-demand security scan, run by the vibe-os:quality-gate skill.
 *
 * Uses the same patterns as the commit-time hooks (see patterns.mjs).
 *
 *   node scan.mjs --all              scan uncommitted changes (git diff HEAD)
 *   node scan.mjs --all --since main scan everything since diverging from main
 *   node scan.mjs --secrets|--code|--deps   run a single check
 *
 * Always exits 0. It reports; the caller decides what to do.
 */

import { existsSync } from 'fs';
import {
  sh, addedLines, isScannableFile, findSecrets,
  findVulnerabilities, formatVulnerabilities, LOCKFILE_AUDITS,
} from './patterns.mjs';

const args = process.argv.slice(2);
const has = flag => args.includes(flag);
const sinceIndex = args.indexOf('--since');
const since = sinceIndex !== -1 ? args[sinceIndex + 1] : null;

const all = has('--all') || args.length === 0;
const want = { secrets: all || has('--secrets'), code: all || has('--code'), deps: all || has('--deps') };

/** The diff to scan, plus a human description of what it covers. */
function target() {
  if (!sh('git rev-parse --is-inside-work-tree').trim()) {
    console.log('Not a git repository — nothing to scan.');
    process.exit(0);
  }

  // A repo with no commits has no HEAD to diff against; staged content is the whole story.
  if (!sh('git rev-parse --verify HEAD').trim()) {
    return { range: '--cached', label: 'staged changes (no commits yet)' };
  }

  if (since) {
    const base = sh(`git merge-base HEAD ${JSON.stringify(since)}`).trim();
    if (base) return { range: `${base}..`, label: `changes since diverging from ${since}` };
    console.log(`No merge base with "${since}" — scanning uncommitted changes instead.`);
  }

  return { range: 'HEAD', label: 'uncommitted changes' };
}

const { range, label } = target();
const changedFiles = sh(`git diff --name-only ${range}`).split('\n').filter(Boolean);

console.log(`Security scan — ${label}${changedFiles.length ? ` (${changedFiles.length} file${changedFiles.length === 1 ? '' : 's'})` : ' (no files changed)'}\n`);

if (want.secrets) {
  const trackedEnv = sh('git ls-files').split('\n').filter(f => /(^|\/)\.env(\..+)?$/.test(f.trim()));
  const findings = findSecrets(addedLines(sh(`git diff ${range}`)), [...changedFiles, ...trackedEnv]);
  console.log(findings.length
    ? `Secrets: ${findings.length} finding${findings.length === 1 ? '' : 's'}\n` + findings.map(f => `  ✗ ${f}`).join('\n') + '\n'
    : 'Secrets: clean\n');
}

if (want.code) {
  const files = changedFiles.filter(isScannableFile);
  const diff = files.length ? sh(`git diff ${range} -- ${files.map(f => JSON.stringify(f)).join(' ')}`) : '';
  const findings = findVulnerabilities(addedLines(diff));
  console.log(findings.length
    ? `Code patterns: ${findings.length} potential issue${findings.length === 1 ? '' : 's'}` + formatVulnerabilities(findings)
    : 'Code patterns: clean\n');
}

if (want.deps) {
  const project = LOCKFILE_AUDITS.find(l => existsSync(l.lockfile));
  if (!project) {
    console.log('Dependencies: no recognized lockfile — skipped\n');
  } else {
    const result = project.parser(sh(project.audit, 60000));
    if (!result) {
      console.log(`Dependencies: audit tool unavailable or returned no usable output (${project.lockfile})\n`);
    } else if (result.critical === 0 && result.high === 0) {
      console.log('Dependencies: no critical or high severity vulnerabilities\n');
    } else {
      const affected = [...new Set(result.packages)];
      console.log(
        `Dependencies: ${result.critical} critical, ${result.high} high` +
        (affected.length ? `\n  Affected: ${affected.join(', ')}` : '') + '\n'
      );
    }
  }
}
