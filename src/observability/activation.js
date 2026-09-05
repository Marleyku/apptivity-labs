/** Activation definition for APPtivity Labs marketing site. */
export const activation = {
  grain: 'visitor',
  description:
    'Visitor activated when they submit a beta application or in-app feedback.',
  events: ['beta_application_submitted', 'feedback_submitted'],
};

export const APP_ID = 'apptivity-labs-site';
