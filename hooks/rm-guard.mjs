#!/usr/bin/env node

/**
 * rm-guard.mjs — PreToolUse hook (Bash matcher)
 *
 * Blocks recursive deletes aimed at the filesystem root, the home directory,
 * or the current directory as a whole. Deleting a named subdirectory
 * (rm -rf ./build, rm -rf node_modules) is left alone.
 *
 * Exit 2 blocks the tool call. Fails open on any error.
 */

import { readHookInput } from './patterns.mjs';

/**
 * An `rm` invocation carrying a recursive flag (-r, -rf, -Rf, --recursive).
 * `git rm` is a different command and is deliberately excluded.
 */
const RECURSIVE_RM = /(?<!\bgit\s)\brm\s+(?:-{1,2}\S+\s+)*(?:-[a-zA-Z]*r|--recursive)/i;

/** Targets that mean "everything": / /* ~ ~/ $HOME $HOME/ . ./ */
const DANGEROUS_TARGET = /^(\/\*?|~\/?|\$HOME\/?|\$\{HOME\}\/?|\.\/?)$/;

export function isDangerous(command) {
  if (!RECURSIVE_RM.test(command)) return false;
  return command
    .split(/\s+/)
    .filter(token => token && !token.startsWith('-'))
    .some(token => DANGEROUS_TARGET.test(token.replace(/^["']|["']$/g, '')));
}

async function main() {
  const { tool_input } = await readHookInput();

  if (!isDangerous(tool_input?.command || '')) process.exit(0);

  process.stderr.write(
    'BLOCKED: recursive delete targeting the filesystem root, home directory, ' +
    'or the whole current directory.\n' +
    'If this is intentional, name the specific paths to delete instead.\n'
  );
  process.exit(2);
}

if (!process.env.RM_GUARD_TEST) main().catch(() => process.exit(0));
