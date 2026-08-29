/**
 * Cloudflare Worker for apptivity.online
 * - Apex → www redirect
 * - Beta application intake (KV)
 * - Static assets via ASSETS binding
 * - /admin* expects Cloudflare Access at the edge; optional Worker gate as defense-in-depth
 */

const ALLOWED_APPS = new Set(['Miles2Go', 'FavorBank', 'APPtivity']);

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

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
