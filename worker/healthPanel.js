/**
 * Edge health probes for the admin control panel.
 * Only public URLs — Cloudflare Workers cannot reach localhost / Tailscale.
 */

const PROBE_TIMEOUT_MS = 8000;
const USER_AGENT = 'APPtivity-Labs-HealthPanel/1.0';

/** @typedef {'frontend' | 'backend'} CheckKind */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   blurb?: string,
 *   checks: Array<{
 *     id: string,
 *     kind: CheckKind,
 *     label: string,
 *     url: string,
 *     self?: boolean,
 *     expectJsonOk?: boolean,
 *   }>,
 * }} ServiceDef
 */

/** @type {ServiceDef[]} */
export const HEALTH_SERVICES = [
  {
    id: 'sites',
    name: 'APPtivity Labs',
    blurb: 'Corporate / marketing site',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'www.apptivity.online',
        url: 'https://www.apptivity.online/',
      },
      {
        id: 'worker',
        kind: 'backend',
        label: 'Worker (this edge)',
        url: 'https://www.apptivity.online/api/ops/health',
        self: true,
      },
    ],
  },
  {
    id: 'miles2go',
    name: 'Miles2Go',
    blurb: 'Household vehicle history',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'Web app',
        url: 'https://mymiles2go.com/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API /api/health',
        url: 'https://mymiles2go.com/api/health',
        expectJsonOk: true,
      },
    ],
  },
  {
    id: 'favorbank',
    name: 'FavorBank',
    blurb: 'Couples favors & rewards',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'Web app',
        url: 'https://www.favorbank.app/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API /api/health',
        url: 'https://www.favorbank.app/api/health',
        expectJsonOk: true,
      },
    ],
  },
  {
    id: 'goatkitz',
    name: 'GOATkitz',
    blurb: 'Storefront + orders',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'Storefront',
        url: 'https://goatkitz.com/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API /api/health',
        url: 'https://goatkitz.com/api/health',
        expectJsonOk: true,
      },
    ],
  },
  {
    id: 'createacal',
    name: 'CreateACal',
    blurb: 'Family calendars',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'Web app',
        url: 'https://www.createacal.com/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API /api/health',
        url: 'https://www.createacal.com/api/health',
        expectJsonOk: true,
      },
    ],
  },
  {
    id: 'goapptivity',
    name: 'GoAPPtivity',
    blurb: 'Group activities (DPAR)',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'Web app (public)',
        url: 'https://goapptivity.com/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API (Tailscale only)',
        url: 'http://linuxmk.wallaby-city.ts.net:3001/api/health',
        edgeUnreachable: true,
        note: 'API listens on Tailscale/LAN only; Cloudflare edge cannot probe it.',
      },
    ],
  },
  {
    id: 'apochromatic',
    name: 'Apochromatic',
    blurb: 'Origin via Cloudflare Tunnel',
    checks: [
      {
        id: 'front',
        kind: 'frontend',
        label: 'apo-origin (HTML)',
        url: 'https://apo-origin.kunzlerfamily.com/',
      },
      {
        id: 'api',
        kind: 'backend',
        label: 'API /api/health',
        url: 'https://apo-origin.kunzlerfamily.com/api/health',
        expectJsonOk: true,
      },
    ],
  },
];

/**
 * @param {string} url
 * @param {{ expectJsonOk?: boolean }} [opts]
 */
async function probeUrl(url, opts = {}) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: {
        'user-agent': USER_AGENT,
        accept: opts.expectJsonOk ? 'application/json, text/plain, */*' : '*/*',
      },
    });
    const ms = Date.now() - started;
    const status = res.status;
    let detail = '';
    let jsonOk = null;

    if (opts.expectJsonOk) {
      try {
        const data = await res.json();
        const nested = data?.data && typeof data.data === 'object' ? data.data : null;
        jsonOk =
          data?.ok === true ||
          data?.success === true ||
          data?.code === 'API_OK' ||
          data?.status === 'ok' ||
          nested?.ok === true ||
          nested?.status === 'ok';
        if (!jsonOk && data?.error) detail = String(data.error).slice(0, 160);
        else if (!jsonOk) detail = 'Unexpected health JSON';
      } catch {
        jsonOk = false;
        detail = 'Non-JSON health response';
      }
    } else {
      // Drain body lightly so connections close cleanly.
      try {
        await res.arrayBuffer();
      } catch {
        /* ignore */
      }
    }

    const httpOk = status >= 200 && status < 400;
    const ok = opts.expectJsonOk ? httpOk && jsonOk === true : httpOk;

    return {
      ok,
      status,
      ms,
      detail: detail || null,
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      ms: Date.now() - started,
      detail: (err && err.message ? String(err.message) : 'Probe failed').slice(0, 200),
    };
  }
}

/**
 * @param {Request} _request
 * @param {Record<string, unknown>} _env
 */
export async function handleOpsHealth(_request, _env) {
  const checkedAt = new Date().toISOString();

  const services = await Promise.all(
    HEALTH_SERVICES.map(async (svc) => {
      const checks = await Promise.all(
        svc.checks.map(async (check) => {
          if (check.edgeUnreachable) {
            return {
              id: check.id,
              kind: check.kind,
              label: check.label,
              url: check.url,
              ok: null,
              skipped: true,
              status: null,
              ms: null,
              detail: check.note || 'Not reachable from Cloudflare edge',
            };
          }
          if (check.self) {
            return {
              id: check.id,
              kind: check.kind,
              label: check.label,
              url: check.url,
              ok: true,
              status: 200,
              ms: 0,
              detail: 'Serving this response',
            };
          }
          const result = await probeUrl(check.url, { expectJsonOk: check.expectJsonOk });
          return {
            id: check.id,
            kind: check.kind,
            label: check.label,
            url: check.url,
            ...result,
          };
        })
      );

      const scored = checks.filter((c) => !c.skipped);
      const okCount = scored.filter((c) => c.ok).length;
      const status =
        scored.length === 0
          ? 'up'
          : okCount === scored.length
            ? 'up'
            : okCount === 0
              ? 'down'
              : 'degraded';

      return {
        id: svc.id,
        name: svc.name,
        blurb: svc.blurb || null,
        status,
        checks,
      };
    })
  );

  const totals = services.reduce(
    (acc, s) => {
      acc[s.status] += 1;
      return acc;
    },
    { up: 0, degraded: 0, down: 0 }
  );

  const overall =
    totals.down > 0 ? 'down' : totals.degraded > 0 ? 'degraded' : 'up';

  return {
    ok: overall === 'up',
    overall,
    checkedAt,
    totals,
    services,
  };
}
