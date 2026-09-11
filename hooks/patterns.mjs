/**
 * patterns.mjs — single source of truth for security patterns and scan helpers.
 *
 * Imported by the commit-time hooks (secret-guard, code-scan, dep-audit) and by
 * scan.mjs, which the quality-gate skill runs. Patterns live here only, so the
 * hooks and the skill can never drift apart.
 */

import { execSync } from 'child_process';

/**
 * Every pattern is tested against one added line. `pattern` finds a candidate;
 * an optional `value` extractor hands the captured value to looksLikeSecretValue,
 * which rejects variable references, code, paths, prose and placeholders. Without
 * a value check the generic rule fired on `token=$PUSHOVER_TOKEN`,
 * `api_key: os.environ/KEY`, `TOKEN = r"(?<!\S)…"` and a comment saying
 * `secret: /boot/config/...` (148 blocks in transcripts, none a real secret).
 */
export const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key', pattern: /-----BEGIN[A-Z ]*PRIVATE KEY-----/ },
  {
    name: 'Generic Secret',
    pattern: /(API_KEY|API_SECRET|SECRET_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY)\s*[=:]\s*(.+)$/i,
    value: m => m[2],
  },
  { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
];

/** Keys that vendor documentation prints as examples. Never real. */
export const KNOWN_EXAMPLE_SECRETS = [
  'AKIAIOSFODNN7EXAMPLE',
  'AKIAI44QH8DHBEXAMPLE',
  'ghp_16C7e42F292c6912E7710c838347Ae178B4a',
];

/** Tracked .env files are a leak; their committed templates are not. */
const ENV_TEMPLATE = /\.env(\..+)?\.(example|sample|template|dist)$|\.env\.(example|sample|template|dist)(\..+)?$/;

/**
 * Whether the text after `KEY=` / `KEY:` reads as a literal credential rather
 * than a reference to one. Takes the first quoted string, else the first
 * shell word, then rejects anything a credential would not look like.
 */
export function looksLikeSecretValue(raw) {
  let v = raw.trim();
  const quote = ['"', "'", '`'].includes(v[0]) ? v[0] : null;
  if (quote) {
    v = v.slice(1);
    const end = v.indexOf(quote);
    if (end !== -1) v = v.slice(0, end);
  } else {
    v = v.split(/[\s;,)]/)[0];
  }
  if (v.length < 8) return false;
  if (/^[$%{<(\[\/~.]/.test(v)) return false;               // $VAR, ${VAR}, %filtered%, <placeholder>, paths
  if (!/^[A-Za-z0-9_\-.+\/=]+$/.test(v)) return false;       // an expression or prose, not one token
  if (/^\w+:\/\//.test(v)) return false;                     // URL
  if (/example|sample|placeholder|change[_-]?me|your[_-]|xxx|dummy|fake|filtered|redacted|test|token|secret|password/i.test(v)) return false;
  if (/^[A-Z][A-Z0-9_]*$/.test(v)) return false;             // CONSTANT_NAME
  if (/^[A-Za-z_]\w*([.\/][A-Za-z_]\w*)+$/.test(v)) return false; // os.environ/KEY, settings.SECRET_KEY
  if (!/\d/.test(v) && !(/[a-z]/.test(v) && /[A-Z]/.test(v)) && v.length < 20) return false; // a plain word
  return true;
}

export const VULNERABILITY_PATTERNS = [
  {
    name: 'Unsafe innerHTML assignment',
    pattern: /\.innerHTML\s*=/,
    severity: 'warning',
    advice: 'Use textContent, or sanitize before assigning.',
  },
  {
    name: 'dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML/,
    severity: 'warning',
    advice: 'Sanitize the content first (e.g. DOMPurify).',
  },
  {
    name: 'eval() usage',
    pattern: /\beval\s*\(/,
    severity: 'warning',
    advice: 'eval() executes arbitrary code. Use JSON.parse() for data.',
  },
  {
    name: 'new Function() constructor',
    pattern: /new\s+Function\s*\(/,
    severity: 'warning',
    advice: 'Equivalent to eval(). Find a safer alternative.',
  },
  {
    name: 'Shell command injection risk',
    pattern: /child_process\.(exec|execSync)\s*\(\s*(`|['"][^'"]*\$\{)/,
    severity: 'warning',
    advice: 'Use execFile/execFileSync with an argument array.',
  },
  {
    name: 'SQL injection risk',
    pattern: /(SELECT|INSERT|UPDATE|DELETE)\s+.*(\$\{|['"\s]*\+\s*\w)/i,
    severity: 'warning',
    advice: 'Use parameterized queries or an ORM.',
  },
  {
    name: 'Hardcoded HTTP URL (not HTTPS)',
    pattern: /["']http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/,
    severity: 'info',
    advice: 'Use HTTPS for external URLs.',
  },
  {
    name: 'Overly permissive CORS',
    pattern: /origin:\s*['"]?\*['"]?|Access-Control-Allow-Origin.*\*/,
    severity: 'warning',
    advice: 'Restrict CORS to specific origins in production.',
  },
];

/** Files whose contents are noisy or irrelevant to scan. */
export const SKIP_FILE_PATTERNS = [
  /\.(test|spec|e2e)\.[jt]sx?$/,
  /__(tests|mocks)__\//,
  /\.config\.[jt]s$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
];

export const INSTALL_PATTERNS = [
  { pattern: /\bnpm\s+(install|i|add|ci)\b/, audit: 'npm audit --json 2>/dev/null', parser: parseNpmAudit },
  { pattern: /\byarn\s+add\b/, audit: 'yarn audit --json 2>/dev/null', parser: parseYarnAudit },
  { pattern: /\bpnpm\s+(install|i|add)\b/, audit: 'pnpm audit --json 2>/dev/null', parser: parseNpmAudit },
  { pattern: /\bpip\s+install\b/, audit: 'pip audit --format=json 2>/dev/null', parser: parsePipAudit },
  { pattern: /\bcargo\s+(add|install)\b/, audit: 'cargo audit --json 2>/dev/null', parser: parseCargoAudit },
];

/** Lockfile → audit command, for scanning a project without an install command to key off. */
export const LOCKFILE_AUDITS = [
  { lockfile: 'pnpm-lock.yaml', audit: 'pnpm audit --json 2>/dev/null', parser: parseNpmAudit },
  { lockfile: 'yarn.lock', audit: 'yarn audit --json 2>/dev/null', parser: parseYarnAudit },
  { lockfile: 'package-lock.json', audit: 'npm audit --json 2>/dev/null', parser: parseNpmAudit },
  { lockfile: 'Cargo.lock', audit: 'cargo audit --json 2>/dev/null', parser: parseCargoAudit },
  { lockfile: 'requirements.txt', audit: 'pip audit --format=json 2>/dev/null', parser: parsePipAudit },
];

export function parseNpmAudit(output) {
  try {
    const vulns = JSON.parse(output).vulnerabilities || {};
    const list = Object.values(vulns);
    const critical = list.filter(v => v.severity === 'critical');
    const high = list.filter(v => v.severity === 'high');
    return {
      critical: critical.length,
      high: high.length,
      packages: [...critical, ...high].map(v => v.name).filter(Boolean),
    };
  } catch {
    return null;
  }
}

export function parseYarnAudit(output) {
  try {
    const advisories = output
      .trim()
      .split('\n')
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(l => l && l.type === 'auditAdvisory')
      .map(l => l.data?.advisory)
      .filter(Boolean);
    const critical = advisories.filter(a => a.severity === 'critical');
    const high = advisories.filter(a => a.severity === 'high');
    return {
      critical: critical.length,
      high: high.length,
      packages: [...critical, ...high].map(a => a.module_name).filter(Boolean),
    };
  } catch {
    return null;
  }
}

export function parsePipAudit(output) {
  try {
    const data = JSON.parse(output);
    const vulns = Array.isArray(data) ? data : data.vulnerabilities || [];
    return { critical: 0, high: vulns.length, packages: vulns.map(v => v.name).filter(Boolean) };
  } catch {
    return null;
  }
}

export function parseCargoAudit(output) {
  try {
    const vulns = JSON.parse(output).vulnerabilities?.list || [];
    return { critical: 0, high: vulns.length, packages: vulns.map(v => v.advisory?.package).filter(Boolean) };
  } catch {
    return null;
  }
}

/** Read and parse the JSON payload Claude Code sends a hook on stdin. */
export async function readHookInput() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  return JSON.parse(input);
}

/** Run a command, returning stdout, or '' if it fails. Never throws, never leaks stderr. */
export function sh(command, timeout = 10000) {
  const options = { encoding: 'utf-8', timeout, stdio: ['ignore', 'pipe', 'ignore'] };
  try {
    return execSync(command, options);
  } catch (err) {
    return err.stdout || '';
  }
}

/** The added (+) lines of a unified diff, without the +++ headers. */
export function addedLines(diff) {
  return diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
}

export function isScannableFile(path) {
  const trimmed = path.trim();
  if (!trimmed) return false;
  return !SKIP_FILE_PATTERNS.some(p => p.test(trimmed));
}

/** Secret findings in the given added lines, plus any .env files in the given file list. */
export function findSecrets(lines, files = []) {
  const findings = [];

  const envFiles = files.map(f => f.trim()).filter(f => /(^|\/)\.env(\..+)?$/.test(f) && !ENV_TEMPLATE.test(f));
  if (envFiles.length) findings.push(`.env file tracked or staged: ${envFiles.join(', ')}`);

  for (const { name, pattern, value } of SECRET_PATTERNS) {
    const hit = lines.find(line => {
      const m = pattern.exec(line);
      if (!m) return false;
      if (KNOWN_EXAMPLE_SECRETS.some(k => line.includes(k))) return false;
      return value ? looksLikeSecretValue(value(m)) : true;
    });
    if (hit) {
      const excerpt = hit.replace(/^\+/, '').slice(0, 80);
      findings.push(`${name}: ${excerpt}${hit.length > 81 ? '…' : ''}`);
    }
  }

  return findings;
}

/** Vulnerability findings in the given added lines. */
export function findVulnerabilities(lines) {
  return VULNERABILITY_PATTERNS
    .map(({ name, pattern, severity, advice }) => {
      const count = lines.filter(line => pattern.test(line)).length;
      return count ? { name, severity, advice, count } : null;
    })
    .filter(Boolean);
}

/** Format vulnerability findings for human output. */
export function formatVulnerabilities(findings) {
  const bySeverity = (sev, icon, label) => {
    const group = findings.filter(f => f.severity === sev);
    if (!group.length) return '';
    return `\n  ${label}:\n` + group
      .map(f => `    ${icon} ${f.name}${f.count > 1 ? ` (${f.count} occurrences)` : ''}\n       ${f.advice}\n`)
      .join('');
  };
  return bySeverity('warning', '⚠️ ', 'Warnings') + bySeverity('info', 'ℹ️ ', 'Info');
}
