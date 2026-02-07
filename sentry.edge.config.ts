// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fc388cd4035da3bb79f64e166e038352@o4510840252989440.ingest.us.sentry.io/4510840260395008",

  // Sample 10% of requests for performance monitoring.
  tracesSampleRate: 0.1,

  // Tag events with the deployment environment.
  environment:
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "development",

  sendDefaultPii: true,
});
