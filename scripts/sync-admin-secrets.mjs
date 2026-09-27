/**
 * Sync admin_username / admin_password from gitignored `.env` to Worker secrets.
 * Usage: node scripts/sync-admin-secrets.mjs
 * Does not print secret values.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

if (!existsSync(envPath)) {
  console.error('Missing .env — add admin_username and admin_password first.');
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, 'utf8'));
const user = env.admin_username || '';
const pass = env.admin_password || '';

if (!user || !pass) {
  console.error('`.env` must define non-empty admin_username and admin_password.');
  process.exit(1);
}

function putSecret(name, value) {
  const result = spawnSync('npx', ['wrangler', 'secret', 'put', name], {
    cwd: root,
    input: value,
    encoding: 'utf8',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.status !== 0) {
    console.error(`Failed to put secret ${name}`);
    process.exit(result.status || 1);
  }
}

putSecret('admin_username', user);
putSecret('admin_password', pass);
console.log('Synced admin_username and admin_password to Worker secrets.');
