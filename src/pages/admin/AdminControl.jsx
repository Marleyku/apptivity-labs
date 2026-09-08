import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

const AUTO_REFRESH_MS = 30_000;

function statusLabel(status) {
  if (status === 'up') return 'Up';
  if (status === 'degraded') return 'Degraded';
  if (status === 'down') return 'Down';
  if (status === 'private') return 'Private';
  return 'Unknown';
}

function checkClass(check) {
  if (check.skipped) return 'ops-check ops-check--skip';
  return check.ok ? 'ops-check ops-check--ok' : 'ops-check ops-check--bad';
}

function checkStatusText(check) {
  if (check.skipped) return 'Private / not edge-probed';
  if (check.status != null) return `HTTP ${check.status}`;
  return 'No response';
}

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export default function AdminControl() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/health', { cache: 'no-store' });
      if (res.status === 401) {
        throw new Error('Authentication required (Cloudflare Access or admin Basic Auth).');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Health check failed (${res.status})`);
      }
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      setError(err.message || 'Failed to load health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const overall = data?.overall || (error ? 'down' : 'unknown');

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            <span />
          </span>
          APPtivity <b>Labs</b>
        </Link>
        <div className="admin-header-actions">
          <Link to="/admin" className="admin-back">
            Catalogs
          </Link>
          <span className="admin-badge">Control</span>
        </div>
      </header>

      <main className="admin-main">
        <p className="admin-kicker">Operations</p>
        <div className="ops-title-row">
          <h1>Master control</h1>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => load({ silent: true })}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Checking…' : 'Refresh'}
          </button>
        </div>
        <p className="admin-lead">
          Live front and backend probes from the Cloudflare edge. Protected by Cloudflare Access. Local /
          Tailscale-only origins are not visible here.
        </p>

        <div className={`ops-overall ops-overall--${overall}`} role="status">
          <div>
            <p className="ops-overall-label">Fleet status</p>
            <p className="ops-overall-value">{statusLabel(overall)}</p>
          </div>
          <div className="ops-overall-meta">
            <span>
              {data
                ? `${data.totals.up} up · ${data.totals.degraded} degraded · ${data.totals.down} down`
                : loading
                  ? 'Probing…'
                  : '—'}
            </span>
            <span>Checked {formatWhen(data?.checkedAt)}</span>
            <span>Auto-refresh {AUTO_REFRESH_MS / 1000}s</span>
          </div>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <ul className="ops-grid">
          {(data?.services || []).map((svc) => (
            <li key={svc.id} className={`ops-card ops-card--${svc.status}`}>
              <header className="ops-card-head">
                <div>
                  <h2>{svc.name}</h2>
                  {svc.blurb ? <p>{svc.blurb}</p> : null}
                </div>
                <span className={`ops-pill ops-pill--${svc.status}`}>{statusLabel(svc.status)}</span>
              </header>
              <ul className="ops-checks">
                {svc.checks.map((check) => (
                  <li key={check.id} className={checkClass(check)}>
                    <div className="ops-check-top">
                      <span className="ops-check-kind">{check.kind === 'frontend' ? 'Front' : 'API'}</span>
                      <span className="ops-check-label">{check.label}</span>
                      <span className="ops-check-ms">
                        {check.skipped ? 'n/a' : check.ms != null ? `${check.ms} ms` : '—'}
                      </span>
                    </div>
                    <div className="ops-check-bottom">
                      {check.skipped ? (
                        <span>{check.url.replace(/^https?:\/\//, '')}</span>
                      ) : (
                        <a href={check.url} target="_blank" rel="noreferrer">
                          {check.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      <span>
                        {checkStatusText(check)}
                        {check.detail ? ` · ${check.detail}` : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {!data && loading ? <p className="admin-muted">Running edge probes…</p> : null}
      </main>
    </div>
  );
}
