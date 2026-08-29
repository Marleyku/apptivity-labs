import { Link } from 'react-router-dom';
import { BrandMark } from '../components/Icons.jsx';

export default function LegalLayout({ kicker, title, lead, updated, children }) {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="brand" to="/">
          <BrandMark />
          <span>
            APPtivity <b>Labs</b>
          </span>
        </Link>
        <Link to="/">Back to home</Link>
      </header>

      <section className="legal-hero">
        <p className="section-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
        {updated ? <p className="legal-updated">{updated}</p> : null}
      </section>

      <section className="legal-body">{children}</section>

      <footer>
        <Link className="brand brand-footer" to="/">
          <BrandMark />
          <span>
            APPtivity <b>Labs</b>
          </span>
        </Link>
        <p className="footer-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/sms-opt-in">SMS Opt-In</Link>
          <a href="mailto:hello@apptivity.online">Contact</a>
        </p>
        <p>© 2026 APPtivity Labs, LLC</p>
      </footer>
    </main>
  );
}
