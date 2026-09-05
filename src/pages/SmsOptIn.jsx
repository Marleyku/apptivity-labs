import { Link } from 'react-router-dom';
import { BrandMark, IconArrow } from '../components/Icons.jsx';

const SMS_NUMBER = '+1 833-633-6162';
const SMS_NUMBER_TEL = '+18336336162';
const APP_NAME = 'APPtivity Labs';

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
        <p>
          {APP_NAME} only sends optional <strong>transactional/service</strong> texts after you opt
          in by texting <strong>START</strong> or <strong>Y</strong>. Consent happens from your
          phone — not through a website form.
        </p>
      </section>

      <section className="consent-panel">
        <div>
          <p className="section-kicker">Opt in by text</p>
          <h2>Text START or Y</h2>
          <p>
            Send <strong>START</strong> or <strong>Y</strong> to our toll-free number to subscribe
            to {APP_NAME} transactional SMS. Consent is never assumed and is never collected through
            a website form.
          </p>
        </div>

        <div className="consent-demo text-opt-in" aria-label="SMS text opt-in instructions">
          <p className="text-opt-in-label">Send this message</p>
          <p className="text-opt-in-keyword">START</p>
          <p className="text-opt-in-to">
            or <strong>Y</strong> to{' '}
            <a href={`sms:${SMS_NUMBER_TEL}?body=START`}>
              <strong>{SMS_NUMBER}</strong>
            </a>
          </p>
          <a className="text-opt-in-cta" href={`sms:${SMS_NUMBER_TEL}?body=START`}>
            Open Messages with START
          </a>
          <p className="fine-print">
            By texting START or Y, you agree to receive transactional/service SMS from APPtivity
            Labs, LLC for: verification and two-factor authentication codes; account notifications;
            customer care and support replies; delivery and fulfillment notices; event, schedule, and
            reminder notices; and security alerts. These are not marketing or promotional messages.
            Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP
            for help. Consent is not a condition of purchase. We do not sell or share mobile
            information with third parties for promotional or marketing purposes. See our{' '}
            <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>
        </div>
      </section>

      <section className="sms-details">
        <article>
          <h3>Messages you may receive</h3>
          <ul>
            <li>Verification and two-factor authentication codes</li>
            <li>Account notifications</li>
            <li>Customer care and support replies</li>
            <li>Delivery and fulfillment notices</li>
            <li>Event, schedule, and reminder notices</li>
            <li>Security alerts</li>
          </ul>
        </article>
        <article>
          <h3>Your choice stays yours</h3>
          <p>
            Opting in is optional. Reply <strong>STOP</strong> anytime to unsubscribe, or{' '}
            <strong>HELP</strong> for assistance. You can also email hello@apptivity.online.
          </p>
        </article>
      </section>

      <section className="sms-program">
        <div className="sms-program-inner">
          <article>
            <h3>Confirmation after START or Y</h3>
            <p>
              “{APP_NAME}: You’re subscribed to transactional SMS for verification codes, account
              notifications, customer care, delivery notices, event/schedule reminders, and security
              alerts. Msg&amp;data rates may apply. Reply HELP for help, STOP to cancel.
              https://www.apptivity.online/sms-opt-in”
            </p>
          </article>
          <article>
            <h3>HELP reply</h3>
            <p>
              “{APP_NAME} Support: Transactional SMS for verification, account notices, customer
              care, delivery notices, events/reminders, and security alerts. Msg&amp;data rates may
              apply. Reply STOP to cancel. Help: hello@apptivity.online”
            </p>
          </article>
          <article>
            <h3>Sample messages</h3>
            <p>
              Verification: “{APP_NAME}: Your verification code is 123456. Do not share this code.”
            </p>
            <p>
              Account: “{APP_NAME}: Account notice — your profile settings were updated.”
            </p>
            <p>
              Customer care: “{APP_NAME}: Support update — we received your request.”
            </p>
            <p>
              Delivery: “{APP_NAME}: Delivery/fulfillment update — your item is on the way.”
            </p>
            <p>
              Events: “{APP_NAME}: Reminder — your scheduled activity starts tomorrow at 9:00 AM.”
            </p>
            <p>
              Security: “{APP_NAME}: Security alert — new sign-in detected. Contact
              hello@apptivity.online if this wasn’t you.”
            </p>
          </article>
        </div>
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
