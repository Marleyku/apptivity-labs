import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout.jsx';

export default function Privacy() {
  return (
    <LegalLayout
      kicker="Privacy Policy"
      title="Privacy Policy"
      lead="This policy explains how APPtivity Labs, LLC handles information for its administrative website and software products."
      updated="Last updated: July 22, 2026"
    >
      <h2>Who we are</h2>
      <p>
        APPtivity Labs, LLC is a software development and technology products company based in Utah.
        Our administrative website is apptivity.online.
      </p>

      <h2>Information we may collect</h2>
      <p>
        We may collect information you provide directly, such as your name, email address, account
        details, support requests, product preferences, household or activity information you choose
        to enter, and communications with us. Products may also collect operational information
        needed to provide features, maintain security, and improve reliability.
      </p>

      <h2>How we use information</h2>
      <p>
        We use information to provide and maintain our websites and products, respond to inquiries,
        support accounts, protect services, comply with legal obligations, and communicate
        service-related updates.
      </p>

      <h2>SMS and mobile information</h2>
      <div className="legal-notice">
        <p>
          <strong>
            Mobile numbers, SMS opt-in data, and consent records will not be sold, rented, or shared
            with third parties or affiliates for marketing or promotional purposes.
          </strong>
        </p>
      </div>
      <p>
        If a product uses SMS, we use mobile information only to provide requested transactional
        account-verification, security, and service-related messages, maintain consent records,
        process opt-out requests, and support compliance. You can also manage consent on our{' '}
        <Link to="/sms-opt-in">SMS Opt-In</Link> page.
      </p>

      <h2>Sharing information</h2>
      <p>
        We may share information with service providers that help us operate our website, products,
        hosting, communications, security, analytics, or support functions. These providers are
        authorized to use information only as needed to provide services to APPtivity Labs. We may
        also disclose information if required by law, to protect rights and safety, or as part of a
        business transfer.
      </p>

      <h2>Data security</h2>
      <p>
        We use reasonable administrative, technical, and organizational safeguards designed to
        protect information. No internet or electronic storage system can be guaranteed to be
        completely secure.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain information for as long as reasonably necessary to provide services, comply with
        legal obligations, resolve disputes, maintain security, and enforce agreements.
      </p>

      <h2>Your choices</h2>
      <p>
        You may contact us to request access, correction, or deletion of information where
        applicable. You may opt out of SMS messages by replying STOP to a message where supported.
      </p>

      <h2>Children</h2>
      <p>
        Our administrative website is not directed to children under 13. Product-specific age
        requirements may be provided in product materials or account flows.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this Privacy Policy may be sent to{' '}
        <a href="mailto:hello@apptivity.online">hello@apptivity.online</a>.
      </p>
    </LegalLayout>
  );
}
