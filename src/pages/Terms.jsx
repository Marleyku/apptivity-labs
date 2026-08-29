import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout.jsx';

export default function Terms() {
  return (
    <LegalLayout
      kicker="Terms"
      title="Terms of Service"
      lead="These terms apply to the APPtivity Labs administrative website and related software products unless separate product terms are provided."
      updated="Last updated: July 22, 2026"
    >
      <h2>About APPtivity Labs</h2>
      <p>
        APPtivity Labs, LLC is a Utah software company that develops practical applications for
        activities, relationships, households, and everyday responsibilities.
      </p>

      <h2>Use of our services</h2>
      <p>
        You agree to use our website and products lawfully, responsibly, and in accordance with
        these terms. You may not interfere with service operation, attempt unauthorized access,
        misuse accounts, or use the services to harm others.
      </p>

      <h2>Accounts and information</h2>
      <p>
        If a product requires an account, you are responsible for providing accurate information and
        maintaining the confidentiality of your login credentials. You are responsible for activity
        under your account.
      </p>

      <h2>Product availability</h2>
      <p>
        Products and features may change over time. We may update, suspend, or discontinue features
        as we improve services, address security or reliability needs, or meet legal requirements.
      </p>

      <h2>SMS terms</h2>
      <div className="legal-notice">
        <p>
          Users may receive transactional account-verification, security, and service-related SMS
          messages from APPtivity Labs products. Message frequency varies. Message and data rates
          may apply. Reply STOP to opt out. Reply HELP for assistance. Consent to SMS is not a
          condition of purchase.
        </p>
      </div>
      <p>
        APPtivity Labs does not claim that marketing messages are sent through its SMS program. SMS
        notices are intended for transactional account, security, and service-related purposes. See
        also our <Link to="/sms-opt-in">SMS Opt-In</Link> page and{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Our website, logos, product names, designs, software, and content are owned by APPtivity
        Labs, LLC or its licensors and are protected by applicable intellectual property laws. These
        terms do not transfer ownership rights to you.
      </p>

      <h2>Disclaimers</h2>
      <p>
        Our website and products are provided on an “as is” and “as available” basis to the fullest
        extent permitted by law. We do not promise uninterrupted availability or error-free
        operation.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, APPtivity Labs, LLC will not be liable for
        indirect, incidental, consequential, special, or punitive damages arising from use of the
        website or products.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms of Service may be sent to{' '}
        <a href="mailto:hello@apptivity.online">hello@apptivity.online</a>.
      </p>
    </LegalLayout>
  );
}
