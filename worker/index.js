/**
 * Cloudflare Worker for apptivity.online
 * - Apex → www redirect
 * - Beta application intake (KV)
 * - In-app FAB feedback → KV + best-effort Linear (Needs Review)
 * - Static assets via ASSETS binding
 * - /admin* expects Cloudflare Access at the edge; optional Worker gate as defense-in-depth
 */

import { createLinearIssueFromFeedback } from './linearFeedback.js';

const ALLOWED_APPS = new Set(['Miles2Go', 'FavorBank', 'APPtivity']);
const FEEDBACK_CATEGORIES = new Set(['general', 'bug', 'idea', 'praise']);
const FEEDBACK_MAX_SCREENSHOT = 3 * 1024 * 1024;
const FEEDBACK_RATE_LIMIT = 8; // per IP per hour

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/**
 * Defense-in-depth for /admin* when Access JWT is present or ADMIN_BASIC_* secrets are set.
 * Edge Access should still be the primary gate (see scripts/setup-cloudflare-access.mjs).
 */
function gateAdmin(request, env) {
  const accessEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (accessEmail) return null;

  const user = env.ADMIN_BASIC_USER;
  const pass = env.ADMIN_BASIC_PASS;
  if (user && pass) {
    const header = request.headers.get('Authorization') || '';
    if (header.startsWith('Basic ')) {
      try {
        const decoded = atob(header.slice(6));
        const idx = decoded.indexOf(':');
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        if (u === user && p === pass) return null;
      } catch {
        /* fall through */
      }
    }
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="APPtivity Labs Admin"',
        'cache-control': 'no-store',
      },
    });
  }

  // No Access identity and no basic fallback — refuse rather than leave admin public.
  return new Response(
    'Admin gallery is locked. Configure Cloudflare Access for /admin* (see README) or set ADMIN_BASIC_USER / ADMIN_BASIC_PASS Worker secrets.',
    {
      status: 401,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    }
  );
}

async function handleBetaApplication(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 254).toLowerCase();
  const app = cleanText(body.app, 40);
  const reason = cleanText(body.reason, 1500);

  if (!name || name.length < 2) return json({ error: 'Please enter your name.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  if (!ALLOWED_APPS.has(app)) return json({ error: 'Please select an app.' }, 400);
  if (!reason || reason.length < 20) {
    return json({ error: 'Please tell us a bit more about why you want to beta test (20+ characters).' }, 400);
  }

  const id = crypto.randomUUID();
  const record = {
    id,
    name,
    email,
    app,
    reason,
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || '',
    ip: request.headers.get('cf-connecting-ip') || '',
  };

  if (!env.BETA_APPLICATIONS) {
    return json({ error: 'Beta applications storage is not configured.' }, 503);
  }

  await env.BETA_APPLICATIONS.put(`beta:${id}`, JSON.stringify(record));
  const indexKey = 'beta:index';
  const existing = (await env.BETA_APPLICATIONS.get(indexKey, 'json')) || [];
  existing.unshift({ id, email, app, submittedAt: record.submittedAt });
  await env.BETA_APPLICATIONS.put(indexKey, JSON.stringify(existing.slice(0, 5000)));

  return json({ ok: true, id });
}

async function handleSmsOptIn(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const phoneDigits = String(body.phone || '').replace(/\D/g, '');
  const consent = body.consent === true;

  if (!consent) {
    return json({ error: 'Consent is required to opt in to SMS messages.' }, 400);
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return json({ error: 'Please enter a valid mobile phone number.' }, 400);
  }

  if (!env.BETA_APPLICATIONS) {
    return json({ error: 'SMS opt-in storage is not configured.' }, 503);
  }

  const id = crypto.randomUUID();
  const record = {
    id,
    phone: phoneDigits,
    consent: true,
    source: 'sms-opt-in',
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || '',
    ip: request.headers.get('cf-connecting-ip') || '',
  };

  await env.BETA_APPLICATIONS.put(`sms:${id}`, JSON.stringify(record));
  const indexKey = 'sms:index';
  const existing = (await env.BETA_APPLICATIONS.get(indexKey, 'json')) || [];
  existing.unshift({
    id,
    phoneLast4: phoneDigits.slice(-4),
    submittedAt: record.submittedAt,
  });
  await env.BETA_APPLICATIONS.put(indexKey, JSON.stringify(existing.slice(0, 5000)));

  return json({ ok: true, id });
}

function parseScreenshotDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return { bytes: null, contentType: null };
  const raw = dataUrl.trim();
  const m = raw.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
  const b64 = m ? m[2] : raw.replace(/^data:[^;]+;base64,/, '');
  const contentType = m ? m[1].toLowerCase().replace('jpg', 'jpeg') : 'image/png';
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (bytes.byteLength < 32) return { bytes: null, contentType: null };
    if (bytes.byteLength > FEEDBACK_MAX_SCREENSHOT) {
      return { error: 'Screenshot is too large (max 3MB).' };
    }
    return { bytes: bytes.buffer, contentType };
  } catch {
    return { error: 'Invalid screenshot data.' };
  }
}

async function checkFeedbackRateLimit(env, ip) {
  if (!env.BETA_APPLICATIONS || !ip) return true;
  const hour = new Date().toISOString().slice(0, 13);
  const key = `feedback:rate:${ip}:${hour}`;
  const current = Number((await env.BETA_APPLICATIONS.get(key)) || '0');
  if (current >= FEEDBACK_RATE_LIMIT) return false;
  await env.BETA_APPLICATIONS.put(key, String(current + 1), { expirationTtl: 60 * 60 * 2 });
  return true;
}

async function handleFeedback(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!(await checkFeedbackRateLimit(env, ip))) {
    return json({ error: 'Too many feedback submissions. Try again later.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const category = cleanText(body.category, 40).toLowerCase();
  const message = cleanText(body.message, 4000);
  const route = cleanText(body.route, 500) || null;
  const userAgent =
    cleanText(body.userAgent, 400) || request.headers.get('user-agent') || null;
  const site = cleanText(body.site, 80) || 'apptivity.online';

  if (!FEEDBACK_CATEGORIES.has(category)) {
    return json({ error: 'Category must be general, bug, idea, or praise.' }, 400);
  }
  if (category === 'bug' && !message) {
    return json({ error: 'A message is required for bug reports.' }, 400);
  }

  const shot = parseScreenshotDataUrl(body.screenshotDataUrl || body.screenshotBase64);
  if (shot.error) return json({ error: shot.error }, 400);
  if (!message && !shot.bytes) {
    return json({ error: 'Message or screenshot is required.' }, 400);
  }

  if (!env.BETA_APPLICATIONS) {
    return json({ error: 'Feedback storage is not configured.' }, 503);
  }

  const id = crypto.randomUUID();
  const record = {
    id,
    category,
    message: message || '(screenshot only)',
    route,
    site,
    userAgent,
    hasScreenshot: !!shot.bytes,
    submittedAt: new Date().toISOString(),
    ip,
    linearIssueId: null,
    linearIdentifier: null,
    linearUrl: null,
  };

  await env.BETA_APPLICATIONS.put(`feedback:${id}`, JSON.stringify(record));
  const indexKey = 'feedback:index';
  const existing = (await env.BETA_APPLICATIONS.get(indexKey, 'json')) || [];
  existing.unshift({
    id,
    category,
    submittedAt: record.submittedAt,
    route,
  });
  await env.BETA_APPLICATIONS.put(indexKey, JSON.stringify(existing.slice(0, 5000)));

  const linearIssue = await createLinearIssueFromFeedback(env, {
    category,
    message: record.message,
    feedbackId: id,
    route,
    userAgent,
    site,
    screenshotBytes: shot.bytes,
    screenshotContentType: shot.contentType,
  });

  if (linearIssue?.id) {
    record.linearIssueId = linearIssue.id;
    record.linearIdentifier = linearIssue.identifier;
    record.linearUrl = linearIssue.url;
    await env.BETA_APPLICATIONS.put(`feedback:${id}`, JSON.stringify(record));
  }

  return json({
    ok: true,
    id,
    reference: linearIssue?.identifier || id,
    linearIdentifier: linearIssue?.identifier || null,
    linearSynced: !!linearIssue?.id,
    linearUrl: linearIssue?.url || null,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'apptivity.online') {
      url.hostname = 'www.apptivity.online';
      return Response.redirect(url.toString(), 308);
    }

    if (isAdminPath(url.pathname)) {
      const denied = gateAdmin(request, env);
      if (denied) return denied;
    }

    if (url.pathname === '/api/beta-applications') {
      return handleBetaApplication(request, env);
    }

    if (url.pathname === '/api/sms-opt-in') {
      return handleSmsOptIn(request, env);
    }

    if (url.pathname === '/api/feedback') {
      return handleFeedback(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
