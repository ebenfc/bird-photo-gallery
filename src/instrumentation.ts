// This file is used to register instrumentation hooks for Next.js.
// It initializes Sentry for server-side and edge runtime error tracking.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Sentry initialization is disabled until @sentry/nextjs is installed and configured.
  // To enable: install @sentry/nextjs, create sentry.server.config.ts and sentry.edge.config.ts,
  // then uncomment the imports below.
  //
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  //   await import("../sentry.server.config");
  // }
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("../sentry.edge.config");
  // }
}

// Sentry error capture is disabled until @sentry/nextjs is installed.
// To enable: install @sentry/nextjs, then uncomment the function below.
//
// export const onRequestError = async (
//   err: Error,
//   request: { path: string; method: string; headers: Record<string, string> },
//   context: { routerKind: string; routePath: string; routeType: string; revalidateReason?: string; renderSource?: string }
// ) => {
//   if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
//     const Sentry = await import("@sentry/nextjs");
//     Sentry.captureException(err, {
//       extra: { request: { path: request.path, method: request.method }, context },
//     });
//   }
// };
