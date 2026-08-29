import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const SORTS = [
  { id: 'rank', label: 'Rank' },
  { id: 'utility', label: 'Utility' },
  { id: 'uniqueness', label: 'Uniqueness' },
  { id: 'consequence', label: 'Consequence' },
];

export default function AdminApp() {
  const { appSlug } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('rank');
  const [kind, setKind] = useState('all');
  const [theme, setTheme] = useState('all');
  const [heroOnly, setHeroOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCatalog(null);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/marketing/${appSlug}/catalog.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Catalog not found (${res.status})`);
        const data = await res.json();
        if (!cancelled) setCatalog(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load catalog');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appSlug]);

  const themes = useMemo(() => {
    if (!catalog?.shots) return [];
    return [...new Set(catalog.shots.map((s) => s.theme))].sort();
  }, [catalog]);

  const features = useMemo(() => {
    if (!catalog?.features) return [];
    const list = [...catalog.features];
    list.sort((a, b) => {
      if (sort === 'utility') return b.utilityScore - a.utilityScore || a.rank - b.rank;
      if (sort === 'uniqueness') return b.uniquenessScore - a.uniquenessScore || a.rank - b.rank;
      if (sort === 'consequence') return b.consequenceScore - a.consequenceScore || a.rank - b.rank;
      return a.rank - b.rank;
    });
    return list;
  }, [catalog, sort]);

  const shots = useMemo(() => {
    if (!catalog?.shots) return [];
    return catalog.shots.filter((s) => {
      if (kind !== 'all' && s.kind !== kind) return false;
      if (theme !== 'all' && s.theme !== theme) return false;
      if (heroOnly && !s.heroApproved) return false;
      return true;
    });
  }, [catalog, kind, theme, heroOnly]);

  const shotById = useMemo(() => {
    const map = new Map();
    for (const s of catalog?.shots || []) map.set(s.id, s);
    return map;
  }, [catalog]);

  if (error) {
    return (
      <div className="admin-shell">
        <header className="admin-header">
          <Link to="/admin" className="admin-back">
            ← Catalogs
          </Link>
        </header>
        <main className="admin-main">
          <h1>{appSlug}</h1>
          <p className="admin-error">{error}</p>
        </main>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="admin-shell">
        <main className="admin-main">
          <p className="admin-muted">Loading catalog…</p>
        </main>
      </div>
    );
  }

  const { meta, positioning, targetConsumers, objectionsAndAnswers, proofPoints, ctaSuggestions } = catalog;

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/admin" className="admin-back">
          ← Catalogs
        </Link>
        <span className="admin-badge">Admin</span>
      </header>

      <main className="admin-main">
        <p className="admin-kicker">{meta.slug}</p>
        <h1>{meta.name}</h1>
        <p className="admin-lead">{positioning?.oneLiner}</p>
        <p className="admin-meta-line">
          {positioning?.category}
          {positioning?.differentiator ? ` · ${positioning.differentiator}` : ''}
          {meta.productUrl ? (
            <>
              {' · '}
              <a href={meta.productUrl} target="_blank" rel="noreferrer">
                {meta.productUrl.replace(/^https?:\/\//, '')}
              </a>
            </>
          ) : null}
        </p>

        <section className="admin-section">
          <h2>Marketing brief</h2>
          <div className="admin-brief-grid">
            <div>
              <h3>Target consumers</h3>
              <ul>
                {(targetConsumers || []).map((c) => (
                  <li key={c.persona}>
                    <strong>{c.persona}</strong>
                    {c.jobsToBeDone?.length ? (
                      <span> — {c.jobsToBeDone.join('; ')}</span>
                    ) : null}
                    {c.pains?.length ? <em className="admin-pains"> Pains: {c.pains.join('; ')}</em> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Proof & CTAs</h3>
              <ul>
                {(proofPoints || []).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="admin-ctas">{(ctaSuggestions || []).join(' · ')}</p>
            </div>
          </div>
          {(objectionsAndAnswers || []).length > 0 && (
            <div className="admin-objections">
              <h3>Objections</h3>
              <dl>
                {objectionsAndAnswers.map((o) => (
                  <div key={o.objection}>
                    <dt>{o.objection}</dt>
                    <dd>{o.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {meta.notes ? <p className="admin-notes">{meta.notes}</p> : null}
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Top 15 features</h2>
            <label className="admin-control">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ol className="admin-feature-list">
            {features.map((f) => (
              <li key={f.id}>
                <div className="admin-feature-top">
                  <span className="admin-rank">#{f.rank}</span>
                  <h3>{f.name}</h3>
                  <span className="admin-scores">
                    U{f.utilityScore} · N{f.uniquenessScore} · C{f.consequenceScore}
                  </span>
                </div>
                <p className="admin-hook">{f.marketingHook}</p>
                <p>
                  <strong>Why:</strong> {f.why}
                </p>
                <p>
                  <strong>How:</strong> {f.howToUse}
                </p>
                <p className="admin-muted">
                  Route: <code>{f.primaryRoute}</code>
                </p>
                {f.shotIds?.length ? (
                  <div className="admin-feature-shots">
                    {f.shotIds.map((id) => {
                      const s = shotById.get(id);
                      if (!s) return null;
                      return (
                        <div key={id} className="admin-shot-pair admin-shot-pair--compact">
                          <img src={s.topDownPath} alt={`${s.alt} (top-down)`} />
                          <img src={s.perspectivePath} alt={`${s.alt} (perspective)`} />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Shot gallery</h2>
            <div className="admin-filters">
              <label className="admin-control">
                Kind
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="all">All</option>
                  <option value="polished">Polished</option>
                  <option value="wireframe">Wireframe</option>
                </select>
              </label>
              <label className="admin-control">
                Theme
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="all">All</option>
                  {themes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={heroOnly} onChange={(e) => setHeroOnly(e.target.checked)} />
                Hero approved
              </label>
            </div>
          </div>

          <div className="admin-gallery">
            {shots.map((s) => (
              <article key={s.id} className="admin-shot">
                <header>
                  <h3>{s.id}</h3>
                  <p>
                    {s.kind} · {s.theme}
                    {s.heroApproved ? ' · hero' : ''}
                  </p>
                </header>
                <div className="admin-shot-pair">
                  <figure>
                    <img src={s.topDownPath} alt={`${s.alt} (top-down)`} />
                    <figcaption>Top-down</figcaption>
                  </figure>
                  <figure>
                    <img src={s.perspectivePath} alt={`${s.alt} (perspective)`} />
                    <figcaption>Perspective</figcaption>
                  </figure>
                </div>
                <p className="admin-alt">{s.alt}</p>
              </article>
            ))}
            {!shots.length ? <p className="admin-muted">No shots match filters.</p> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
