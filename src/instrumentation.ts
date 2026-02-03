// This file is used to register instrumentation hooks for Next.js.
// It initializes Sentry for server-side and edge runtime error tracking.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    revalidateReason?: string;
    renderSource?: string;
  }
) => {
  // Only import Sentry when needed to avoid issues during build
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(err, {
      extra: {
        request: {
          path: request.path,
          method: request.method,
        },
        context,
      },
    });
  }
};
