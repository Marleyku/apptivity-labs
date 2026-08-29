/**
 * Cloudflare Worker for apptivity.online
 * - Apex → www redirect
 * - Beta application intake (KV)
 * - Static assets via ASSETS binding
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'apptivity.online') {
      url.hostname = 'www.apptivity.online';
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === '/api/beta-applications') {
      return handleBetaApplication(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
