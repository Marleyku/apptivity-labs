#!/usr/bin/env node
/**
 * Create Cloudflare Access application for www.apptivity.online/admin*
 *
 * Prerequisites:
 * 1. Enable Zero Trust once in https://one.dash.cloudflare.com/ (click Enable Access if shown)
 * 2. API token with:
 *    - Access: Organizations, Identity Providers, and Groups Write
 *    - Access: Apps and Policies Write
 *
 * Usage:
 *   export CLOUDFLARE_API_TOKEN=...
 *   export CLOUDFLARE_ACCOUNT_ID=987539556123157f25da0488779bc326
 *   node scripts/setup-cloudflare-access.mjs
 *
 * Optional:
 *   ALLOW_EMAILS=mkunzler@gmail.com,other@example.com
 *   AUTH_DOMAIN=apptivity-labs.cloudflareaccess.com
 */
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '987539556123157f25da0488779bc326';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
const ALLOW_EMAILS = (process.env.ALLOW_EMAILS || 'mkunzler@gmail.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const AUTH_DOMAIN = process.env.AUTH_DOMAIN || 'apptivity-labs.cloudflareaccess.com';
const APP_NAME = 'APPtivity Labs Admin';

if (!TOKEN) {
  console.error('Set CLOUDFLARE_API_TOKEN (Access write scopes required).');
  process.exit(1);
}

async function cf(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) {
    const err = new Error(JSON.stringify(data.errors || data, null, 2));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data.result;
}

async function ensureOrg() {
  try {
    return await cf('GET', `/accounts/${ACCOUNT}/access/organizations`);
  } catch (e) {
    const msg = JSON.stringify(e.data || e.message);
    if (msg.includes('not_enabled') || e.status === 404 || msg.includes('1001')) {
      console.log('Creating Zero Trust organization…');
      return await cf('POST', `/accounts/${ACCOUNT}/access/organizations`, {
        name: 'APPtivity Labs',
        auth_domain: AUTH_DOMAIN,
      });
    }
    throw e;
  }
}

async function ensureOtpIdp() {
  const idps = await cf('GET', `/accounts/${ACCOUNT}/access/identity_providers`);
  const otp = (idps || []).find((i) => i.type === 'onetimepin');
  if (otp) {
    console.log('OTP IdP already present:', otp.id);
    return otp;
  }
  console.log('Creating One-time PIN identity provider…');
  return await cf('POST', `/accounts/${ACCOUNT}/access/identity_providers`, {
    name: 'One-time PIN',
    type: 'onetimepin',
    config: {},
  });
}

async function ensureApp() {
  const apps = await cf('GET', `/accounts/${ACCOUNT}/access/apps`);
  const existing = (apps || []).find(
    (a) =>
      a.name === APP_NAME ||
      (a.domain && String(a.domain).includes('apptivity.online/admin')) ||
      (a.destinations || []).some((d) => d.uri && String(d.uri).includes('apptivity.online/admin'))
  );
  if (existing) {
    console.log('Access app already exists:', existing.id, existing.domain || existing.name);
    return existing;
  }

  console.log('Creating Access application for /admin* …');
  return await cf('POST', `/accounts/${ACCOUNT}/access/apps`, {
    name: APP_NAME,
    type: 'self_hosted',
    domain: 'www.apptivity.online/admin',
    destinations: [
      { type: 'public', uri: 'www.apptivity.online/admin' },
      { type: 'public', uri: 'www.apptivity.online/admin/*' },
      { type: 'public', uri: 'apptivity.online/admin' },
      { type: 'public', uri: 'apptivity.online/admin/*' },
    ],
    session_duration: '24h',
    auto_redirect_to_identity: false,
    app_launcher_visible: true,
    policies: [
      {
        name: 'Allow operator emails',
        decision: 'allow',
        include: [{ email: { email: ALLOW_EMAILS[0] } }, ...ALLOW_EMAILS.slice(1).map((email) => ({ email: { email } }))],
      },
    ],
  });
}

async function main() {
  const org = await ensureOrg();
  console.log('Org auth_domain:', org.auth_domain || AUTH_DOMAIN);
  await ensureOtpIdp();
  const app = await ensureApp();
  console.log('\nDone.');
  console.log('Verify: open https://www.apptivity.online/admin and complete Access login as', ALLOW_EMAILS.join(', '));
  console.log('App id:', app.id);
}

main().catch((e) => {
  console.error('Failed:', e.message || e);
  if (String(e.message || '').includes('not_enabled')) {
    console.error('\nOpen https://one.dash.cloudflare.com/ and click Enable Access, then re-run.');
  }
  process.exit(1);
});
