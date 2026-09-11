// node --test hooks/*.test.mjs
// Corpus: every line the secret-guard hook blocked across ~/.claude/projects
// transcripts up to 2026-09-11 (148 blocks, 17 sessions, zero real secrets).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSecrets } from './patterns.mjs';

const FALSE_POSITIVES = [
  '+    --form-string "token=$PUSHOVER_TOKEN" --form-string "user=$PUSHOVER_USER" \\',
  '+    --form-string "token=$PUSHOVER_TOKEN" \\',
  '+  --data-urlencode "token=$PUSHOVER_TOKEN" --data-urlencode "user=$PUSHOVER_USER"',
  '+export INFLUX_PASSWORD="$INFLUXDB_ADMIN_PASSWORD"',
  '+INFLUX_PASSWORD="$INFLUX_PW" python3 -m ha_influx_backfill --source mysql-states',
  '+      api_key: os.environ/UNSLOTH_API_KEY',
  '+      if (previous !== undefined) process.env.RESEND_API_KEY = previous;',
  '+COMPOSE_CONFIG_TOKEN = r"(?<!\\S)(?<!-f )(?<!--file )(?<!--file=)config(?!\\S)"',
  '+#   secret:   /boot/config/plugins/qbt-vpn-check/push-url   (mode 600, NOT in git)',
  '+    ⚠️ DuckDNS has ONE account-wide token: recreating it invalidates the old',
  '+    newUrl.password = "%filtered%";',
  '+  defineSecret: vi.fn(() => ({ value: vi.fn(() => "http://worker.test") })),',
  '+  defineSecret: vi.fn(() => ({ value: vi.fn(() => WORKER_URL) })),',
  '+  defineSecret: vi.fn((name: string) => ({',
  '+        botToken: "xoxb-test",',
  '+    setDoc("organizations/org-1/slackConfig/default", { botToken: "xoxb-test" });',
  '+const TOKEN = "cal-token-1";',
  '+    const token = config?.botToken || null;',
  '+  const botToken = config?.botToken;',
  '+    const token = slackWorkerToken.value();',
  "+    return /^\\s*GITHUB_TOKEN=.+/m.test(readFileSync('app/.dev.vars', 'utf8'));",
  '+const k = "AKIAIOSFODNN7EXAMPLE"',
  '+    "ghp_16C7e42F292c6912E7710c838347Ae178B4a",',
  '+  SECRET_KEY = settings.SECRET_KEY',
  '+PASSWORD=${DB_PASSWORD}',
  '+  token: <your-token-here>',
  '+  API_KEY=changeme',
];

// Assembled at runtime so this file never holds a credential-shaped line
// itself (the guard would otherwise block the commit that adds the test).
const kv = (key, value) => `+${key} = ${value}`;
const TRUE_POSITIVES = [
  kv('API_KEY', '"sk-proj-' + '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"'),
  '+  password: ' + 'hunter2' + 'hunter2',
  kv('SECRET_KEY', '8f3a9c2e1b7d' + '4f6a0e5c3b9d8a7f2e1c'),
  '+    botToken: "xoxb-1234567890-' + 'abcdefghijklmnop",',
  kv('export PUSHOVER_TOKEN', 'azGDORePK8gMaC0' + 'QOYAMyEEuzJnyUi'),
  kv('aws_access_key_id', 'AKIA' + 'IOSFODNN7REALKEY'),
  kv('GITHUB_TOKEN', 'ghp_' + 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0'),
  '+-----BEGIN RSA ' + 'PRIVATE KEY-----',
  '+PASSWORD=$PW TOKEN=' + 'abc12345def67890',            // literal after a variable reference
  kv('STRIPE_SECRET_KEY', 'sk_test_' + '51H8f9K2l3M4n5O6p7Q8r9S0'), // "test" inside a real key
  '+{password:' + 'hunter2hunter2}',                       // compact object literal
];

test('does not flag variable references, code, paths, prose, or documented example keys', () => {
  for (const line of FALSE_POSITIVES) {
    assert.deepEqual(findSecrets([line]), [], `should not flag: ${line}`);
  }
});

test('still flags literal credentials', () => {
  for (const line of TRUE_POSITIVES) {
    assert.ok(findSecrets([line]).length, `should flag: ${line}`);
  }
});

test('flags .env files but not their example templates', () => {
  assert.deepEqual(findSecrets([], ['.env.example', 'evals/.env.example', '.env.sample', 'app/.env.template']), []);
  assert.ok(findSecrets([], ['.env']).length);
  assert.ok(findSecrets([], ['app/.env.production']).length);
  assert.ok(findSecrets([], ['.env.local']).length);
});
