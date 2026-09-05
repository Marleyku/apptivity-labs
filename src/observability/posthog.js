import posthog from 'posthog-js';

let started = false;

export function initPostHog({ appId, activation } = {}) {
  if (started) return posthog;
  const key = import.meta.env.VITE_POSTHOG_PROJECT_KEY;
  const enabled = import.meta.env.VITE_POSTHOG_CAPTURE_ENABLED !== 'false';
  if (!key || !enabled) return null;

  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      if (appId) ph.register({ app_id: appId });
      if (activation?.description) {
        ph.register({
          activation_grain: activation.grain || 'user',
          activation_description: activation.description,
        });
      }
    },
  });
  started = true;
  return posthog;
}

export function getPostHog() {
  return started ? posthog : null;
}

/** Fire once when the user completes the app's activation action. */
export function trackActivation(eventName, properties = {}) {
  const ph = getPostHog();
  if (!ph || !eventName) return;
  ph.capture(eventName, { ...properties, is_activation_event: true });
}

export function trackEvent(eventName, properties = {}) {
  const ph = getPostHog();
  if (!ph || !eventName) return;
  ph.capture(eventName, properties);
}
