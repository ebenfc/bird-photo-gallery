// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fc388cd4035da3bb79f64e166e038352@o4510840252989440.ingest.us.sentry.io/4510840260395008",

  // Sample 10% of requests for performance monitoring.
  // Free plan has limited quota — 10% gives enough data to spot
  // slow endpoints without burning through the monthly allowance.
  tracesSampleRate: 0.1,

  // Tag events with the deployment environment so you can filter
  // "production" vs "preview" vs "development" in the Sentry dashboard.
  environment:
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "development",

  sendDefaultPii: true,
});
