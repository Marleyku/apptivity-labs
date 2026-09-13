import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout.jsx';

/** Labs Terms version — keep in sync with docs/legal/TOS-TEMPLATE.md */
export const TERMS_VERSION = '2026-09-09';

export default function Terms() {
  return (
    <LegalLayout
      kicker="Terms"
      title="Terms of Service"
      lead="These Terms govern APPtivity Labs websites and products operated by APPtivity Labs, LLC, unless a product publishes separate addenda."
      updated={`Effective September 9, 2026 · Version ${TERMS_VERSION}`}
    >
      <p>
        These Terms of Service (“Terms”) govern your access to and use of APPtivity Labs websites
        and products (the “Service”), operated by APPtivity Labs, LLC (“we,” “us,” or “our”). By
        creating an account, accessing, or using the Service, you agree to these Terms. If you do
        not agree, do not use the Service.
      </p>

      <h2>1. Agreement to Terms</h2>
      <p>
        You must accept these Terms and our <Link to="/privacy">Privacy Policy</Link> to use the
        Service. We may require re-acceptance when we publish a new version ({TERMS_VERSION} and
        later).
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be able to form a binding contract under applicable law. If you use the Service on
        behalf of an organization, you represent that you have authority to bind that organization.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for activity under your account and for keeping credentials and devices
        secure. Provide accurate information. We may suspend or terminate accounts that violate
        these Terms or that create risk to the Service or other users.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, harmful, fraudulent, or abusive purposes</li>
        <li>Attempt unauthorized access to systems, data, or other users’ accounts</li>
        <li>Interfere with or disrupt the Service, including abuse of APIs or rate limits</li>
        <li>Upload malware or content you do not have rights to use</li>
        <li>Circumvent security, privacy, billing, or consent controls</li>
      </ul>
      <p>
        We may investigate and take action, including suspension or termination, for violations.
      </p>

      <h2>5. Required telemetry and error monitoring</h2>
      <div className="legal-notice">
        <p>
          <strong>
            Using the Service requires your consent to privacy-preserving product analytics, session
            diagnostics / replay (where enabled), and error monitoring.
          </strong>{' '}
          These tools are used solely to operate, secure, debug, and improve the Service. Declining
          this required telemetry means you cannot use account-based products.
        </p>
      </div>
      <p>
        We design collection to avoid passwords, payment secrets, and raw document or message
        contents in analytics payloads where feasible. Processors that help us run these tools act
        on our instructions. Optional purposes (for example marketing attribution or non-essential
        experiments) remain opt-in where offered and are not required for core use. Details appear
        in our <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>6. No sale, trade, or exchange of personal information</h2>
      <div className="legal-notice">
        <p>
          <strong>
            To the fullest extent permitted by applicable law, we do not sell, trade, or exchange
            your personal information for money or other valuable consideration, and we do not share
            personal information with third parties for their independent promotional or marketing
            purposes.
          </strong>
        </p>
      </div>
      <p>
        We may share information with service providers / subprocessors that process data on our
        behalf to operate the Service (hosting, communications, analytics, error monitoring, payment
        processing, and similar). SMS and mobile information, where collected, is not sold or shared
        with third parties or affiliates for their marketing or promotional purposes; see{' '}
        <Link to="/sms-opt-in">SMS Opt-In</Link>.
      </p>

      <h2>7. User content</h2>
      <p>
        You retain rights to content you submit. You grant us a non-exclusive, worldwide license to
        host, store, process, and display that content as needed to provide and improve the Service.
        You represent that you have the rights needed to submit the content and that it does not
        violate law or others’ rights. Product-specific IP rules may appear in product addenda.
      </p>

      <h2>8. SMS and transactional messages</h2>
      <div className="legal-notice">
        <p>
          Users may receive transactional account-verification, security, and service-related SMS
          messages from APPtivity Labs products. Message frequency varies. Message and data rates
          may apply. Reply STOP to opt out. Reply HELP for assistance. Consent to SMS is not a
          condition of purchase.
        </p>
      </div>
      <p>
        SMS notices are intended for transactional account, security, and service-related purposes.
        See our <Link to="/sms-opt-in">SMS Opt-In</Link> page and{' '}
        <Link to="/privacy">Privacy Policy</Link>. Consent to SMS is separate from these Terms and
        from required telemetry consent.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        Our website, logos, product names, designs, software, and content are owned by APPtivity
        Labs, LLC or its licensors and are protected by applicable intellectual property laws. These
        Terms do not transfer ownership rights to you.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW,
        WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. We do not warrant uninterrupted or error-free operation.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPtivity Labs, LLC AND ITS AFFILIATES WILL NOT BE
        LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST
        PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY
        FOR CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US
        FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS
        (US $100).
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You will defend and indemnify APPtivity Labs, LLC against claims arising from your misuse of
        the Service, your content, or your violation of these Terms or applicable law, to the extent
        permitted by law.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Utah, excluding conflict-of-law rules.
        Courts in Utah have exclusive jurisdiction, except where prohibited by law.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update these Terms. The effective date and version above will change when we do.
        Continued use after the effective date of updated Terms, or explicit re-acceptance when we
        require it, constitutes acceptance. Material changes that require re-consent will be
        surfaced in-app where accounts exist.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms of Service may be sent to{' '}
        <a href="mailto:marley@goapptivity.com">marley@goapptivity.com</a>.
      </p>
      <p>APPtivity Labs, LLC</p>
    </LegalLayout>
  );
}
