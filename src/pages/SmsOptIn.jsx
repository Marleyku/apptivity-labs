import { Link } from 'react-router-dom';
import { BrandMark, IconArrow } from '../components/Icons.jsx';

export default function SmsOptIn() {
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
          <p className="section-kicker">The exact opt-in</p>
          <h2>What you agree to</h2>
          <p>
            This consent appears next to the phone-number field in our applications. The checkbox is
            optional, separate from our Terms and Privacy Policy, and is never pre-selected.
          </p>
        </div>
        <div className="consent-demo" aria-label="Example SMS consent form">
          <label>
            Mobile phone number
            <input type="tel" placeholder="(555) 555-5555" readOnly />
          </label>
          <label className="check-row">
            <input type="checkbox" readOnly />
            <span>
              <strong>I agree to receive SMS text messages from APPtivity Labs, LLC</strong> for
              account verification codes, authentication, security alerts, and important account
              notifications.
            </span>
          </label>
          <p className="fine-print">
            Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP
            for help. Consent is not a condition of purchase. We do not sell or share mobile
            information with third parties for promotional or marketing purposes. See our Privacy
            Policy and Terms of Service.
          </p>
          <button type="button">Continue</button>
        </div>
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
