/**
 * Load gitignored `.env` with dotenv (correct quoting / escapes / # in values).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Single-quote for dotenv literal values (safe for # $ " ! ` spaces). */
export function dotenvSingleQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export function loadSiteEnv(envPath = resolve(root, '.env')) {
  if (!existsSync(envPath)) {
    throw new Error(`Missing ${envPath}`);
  }
  return dotenv.parse(readFileSync(envPath));
}

export function getAdminCredentials(env = loadSiteEnv()) {
  const user = env.ADMIN_USERNAME || env.admin_username || '';
  let pass = env.ADMIN_PASSWORD || env.admin_password || '';

  // Optional base64 form — immune to .env metacharacters
  const b64 = env.ADMIN_PASSWORD_B64 || env.admin_password_b64 || '';
  if (b64) {
    pass = Buffer.from(b64, 'base64').toString('utf8');
  }

  if (!user || !pass) {
    throw new Error(
      'Set ADMIN_USERNAME and ADMIN_PASSWORD (or ADMIN_PASSWORD_B64) in .env. ' +
        "Use single quotes for special characters, e.g. ADMIN_PASSWORD='p@ss#word$'"
    );
  }

  return { user, pass, envPath: resolve(root, '.env') };
}
