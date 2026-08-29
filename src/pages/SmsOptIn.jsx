import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark, IconArrow, IconCheck } from '../components/Icons.jsx';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 15);
}

function formatPhoneUS(digits) {
  const d = digitsOnly(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export default function SmsOptIn() {
  const [phoneDigits, setPhoneDigits] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('sending');

    try {
      const res = await fetch('/api/sms-opt-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone: phoneDigits,
          consent: true,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Submission failed.');
      setPhoneDigits('');
      setConsent(false);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
      setStatus('error');
    }
  }

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
        <p className="section-kicker">SMS messaging consent</p>
        <h1>
          Clear consent.
          <br />
          <span>No surprises.</span>
        </h1>
        <p>APPtivity Labs only sends text messages after you explicitly choose to receive them.</p>
      </section>

      <section className="consent-panel">
        <div>
          <p className="section-kicker">Opt in here</p>
          <h2>Submit your number</h2>
          <p>
            Use this form to record SMS consent for APPtivity Labs account messages. The checkbox is
            required, separate from our Terms and Privacy Policy, and is never pre-selected.
          </p>
        </div>

        {status === 'success' ? (
          <div className="consent-demo consent-success" role="status">
            <IconCheck />
            <h3>You’re opted in</h3>
            <p>
              We’ve recorded your consent. You can withdraw anytime by replying STOP to a message, or
              email hello@apptivity.online.
            </p>
            <button type="button" className="button button-quiet" onClick={() => setStatus('idle')}>
              Submit another number
            </button>
          </div>
        ) : (
          <form className="consent-demo" onSubmit={onSubmit} aria-label="SMS opt-in form">
            <label>
              Mobile phone number
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 555-5555"
                value={formatPhoneUS(phoneDigits)}
                onChange={(e) => {
                  setPhoneDigits(digitsOnly(e.target.value));
                  setError('');
                }}
                required
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                name="consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setError('');
                }}
                required
              />
              <span>
                <strong>I agree to receive SMS text messages from APPtivity Labs, LLC</strong> for
                account verification codes, authentication, security alerts, and important account
                notifications.
              </span>
            </label>
            <p className="fine-print">
              Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP
              for help. Consent is not a condition of purchase. We do not sell or share mobile
              information with third parties for promotional or marketing purposes. See our{' '}
              <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
            </p>
            {status === 'error' && error ? <p className="form-error">{error}</p> : null}
            <button type="submit" disabled={status === 'sending' || !consent || phoneDigits.length < 10}>
              {status === 'sending' ? 'Submitting…' : 'Submit opt-in'}
            </button>
          </form>
        )}
      </section>

      <section className="sms-details">
        <article>
          <h3>Messages you may receive</h3>
          <p>
            One-time verification codes, login and authentication messages, security alerts, and
            important notices about your APPtivity Labs account.
          </p>
        </article>
        <article>
          <h3>Your choice stays yours</h3>
          <p>
            Opting in is optional. You can withdraw consent at any time by replying STOP. For
            assistance, reply HELP or email hello@apptivity.online.
          </p>
        </article>
      </section>

      <section className="sms-help">
        <h2>SMS support</h2>
        <p>Questions about text messaging or your consent?</p>
        <a href="mailto:hello@apptivity.online">
          hello@apptivity.online <IconArrow />
        </a>
        <p>APPtivity Labs, LLC</p>
      </section>
    </main>
  );
}
