// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fc388cd4035da3bb79f64e166e038352@o4510840252989440.ingest.us.sentry.io/4510840260395008",

  integrations: [Sentry.replayIntegration()],

  // Sample 5% of page loads for client-side performance traces.
  // Client traces are higher volume than server traces (every browser
  // generates them), so we sample lower to stay within free plan quota.
  tracesSampleRate: 0.05,

  // Tag events with the deployment environment.
  // Only NEXT_PUBLIC_* vars are available in the browser.
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",

  // Record 5% of normal sessions for replay.
  // Free plan has limited replays — 5% keeps usage sustainable.
  replaysSessionSampleRate: 0.05,

  // Always record a replay when an error happens — this is the most
  // valuable use of replays (seeing what the user did before the error).
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
