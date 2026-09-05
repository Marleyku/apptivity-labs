import { APP_ID, activation } from './activation.js';
import { initPostHog, trackActivation, trackEvent } from './posthog.js';
import { initSentry } from './sentry.js';

export function initObservability() {
  initSentry({ appName: APP_ID });
  initPostHog({ appId: APP_ID, activation });
}

export { trackActivation, trackEvent, activation, APP_ID };
