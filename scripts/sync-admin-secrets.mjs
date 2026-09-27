/**
 * Sync ADMIN_USERNAME / ADMIN_PASSWORD from gitignored `.env` to Worker secrets.
 * Uses dotenv so # $ " and other special characters survive correctly.
 * Usage: node scripts/sync-admin-secrets.mjs
 * Does not print secret values.
 */
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAdminCredentials } from './lib/loadEnv.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let user;
let pass;
try {
  ({ user, pass } = getAdminCredentials());
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}

function putSecret(name, value) {
  // Never pass secrets on the argv shell; stdin only. No trailing newline.
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

putSecret('ADMIN_USERNAME', user);
putSecret('ADMIN_PASSWORD', pass);
console.log(
  `Synced ADMIN_USERNAME (${user.length} chars) and ADMIN_PASSWORD (${pass.length} chars) to Worker secrets.`
);
