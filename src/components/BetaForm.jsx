import { useState } from 'react';
import { IconArrow, IconCheck, IconGift } from './Icons.jsx';
import { trackActivation } from '../observability/index.js';

const APPS = ['Miles2Go', 'FavorBank', 'APPtivity'];

export default function BetaForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/beta-applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          app: data.get('app'),
          reason: data.get('reason'),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Submission failed.');
      trackActivation('beta_application_submitted', { app: data.get('app') });
      form.reset();
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="beta-success" role="status">
        <IconCheck />
        <h3>Application received!</h3>
        <p>
          Thanks for offering to help shape better software. We’ll review your
          application and contact you by email if there’s a good fit.
        </p>
        <button type="button" className="button button-quiet" onClick={() => setStatus('idle')}>
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form className="beta-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label>
          Full name
          <input name="name" autoComplete="name" required maxLength={100} placeholder="Your name" data-feedback-mask />
        </label>
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            data-feedback-mask
          />
        </label>
      </div>
      <label>
        Which app would you like to test?
        <select name="app" required defaultValue="">
          <option value="" disabled>
            Select an app
          </option>
          {APPS.map((app) => (
            <option key={app} value={app}>
              {app}
            </option>
          ))}
        </select>
      </label>
      <label>
        Why do you want to beta test this app?
        <textarea
          name="reason"
          required
          minLength={20}
          maxLength={1500}
          rows={5}
          placeholder="Tell us how you would use it and the kind of feedback you can provide…"
        />
      </label>
      {status === 'error' && error ? <p className="form-error">{error}</p> : null}
      <button className="button beta-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Apply to beta test'} <IconArrow />
      </button>
      <p className="form-note">We’ll use your information only to evaluate and contact you about beta testing.</p>
    </form>
  );
}

export function BetaReward() {
  return (
    <div className="beta-reward">
      <IconGift />
      <p>
        <strong>Your contribution matters.</strong> Approved beta testers will receive a free
        subscription, with the subscription length and plan level based on their contribution to
        testing and feedback.
      </p>
    </div>
  );
}
