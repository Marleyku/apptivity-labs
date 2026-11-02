/**
 * Rewrite ADMIN_* lines in `.env` using dotenv single-quotes so special
 * characters (# $ " ! ` spaces) are stored literally.
 *
 * Prefer this over JSON.stringify / bare unquoted values.
 * Usage: node scripts/normalize-admin-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dotenvSingleQuote, getAdminCredentials } from './lib/loadEnv.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

if (!existsSync(envPath)) {
  console.error('Missing .env');
  process.exit(1);
}

const { user, pass } = getAdminCredentials();
let text = readFileSync(envPath, 'utf8');

// Drop any prior admin credential lines (any casing / b64 variant we manage)
text = text
  .split(/\r?\n/)
  .filter((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return true;
    return !/^(ADMIN_USERNAME|ADMIN_PASSWORD|ADMIN_PASSWORD_B64|admin_username|admin_password|admin_password_b64)\s*=/.test(
      t
    );
  })
  .join('\n')
  .replace(/\n{3,}/g, '\n\n');

if (!text.endsWith('\n')) text += '\n';

text += `
# Admin Basic Auth for /admin* (single-quoted so # $ " ! etc. stay literal)
# Sync to Worker: npm run secrets:admin
# Optional: ADMIN_PASSWORD_B64='...'  (base64 UTF-8) instead of ADMIN_PASSWORD
ADMIN_USERNAME=${dotenvSingleQuote(user)}
ADMIN_PASSWORD=${dotenvSingleQuote(pass)}
`;

writeFileSync(envPath, text, { mode: 0o600 });
console.log(
  `Normalized .env admin credentials with single quotes (user ${user.length} chars, pass ${pass.length} chars).`
);
