import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const KNOWN = [
  { slug: 'miles2go', name: 'Miles2Go', blurb: 'Household vehicle history' },
  { slug: 'favorbank', name: 'FavorBank', blurb: 'Couples favors & rewards' },
  { slug: 'apptivity', name: 'APPtivity', blurb: 'Group activities (DPAR)' },
];

export default function AdminIndex() {
  const [catalogs, setCatalogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await Promise.all(
        KNOWN.map(async (app) => {
          try {
            const res = await fetch(`/marketing/${app.slug}/catalog.json`, { cache: 'no-store' });
            if (!res.ok) return { ...app, ready: false };
            const data = await res.json();
            return {
              ...app,
              ready: true,
              updatedAt: data.meta?.updatedAt,
              featureCount: data.features?.length ?? 0,
              shotCount: data.shots?.length ?? 0,
              oneLiner: data.positioning?.oneLiner,
            };
          } catch {
            return { ...app, ready: false };
          }
        })
      );
      if (!cancelled) setCatalogs(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            <span />
          </span>
          APPtivity <b>Labs</b>
        </Link>
        <span className="admin-badge">Admin</span>
      </header>

      <main className="admin-main">
        <p className="admin-kicker">Marketing catalog</p>
        <h1>Product galleries</h1>
        <p className="admin-lead">
          Feature rankings, selling copy, and iPhone 16 framed shot pairs (top-down + perspective). Protected by
          Cloudflare Access.
        </p>

        <ul className="admin-app-list">
          {(catalogs.length ? catalogs : KNOWN).map((app) => (
            <li key={app.slug}>
              <Link to={`/admin/${app.slug}`} className="admin-app-card">
                <div>
                  <h2>{app.name}</h2>
                  <p>{app.oneLiner || app.blurb}</p>
                </div>
                <div className="admin-app-meta">
                  {app.ready ? (
                    <>
                      <span>{app.featureCount} features</span>
                      <span>{app.shotCount} shots</span>
                    </>
                  ) : (
                    <span className="admin-muted">Catalog pending</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
