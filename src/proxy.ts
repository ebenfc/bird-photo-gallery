import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

// Define public routes (everything else requires authentication)
const isPublicRoute = createRouteMatcher([
  '/',              // Landing page for unauthenticated users
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk', // Clerk webhook endpoint
  '/api/haikubox/sync', // Haikubox cron (auth handled in route via CRON_SECRET)
  '/api/health',    // Health check for monitoring tools
  '/u/(.*)',        // Public user galleries
  '/api/public/(.*)', // Public API endpoints
  '/monitoring',    // Sentry tunnel route
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    const { isAuthenticated, redirectToSignIn } = await auth();
    if (!isAuthenticated) {
      return redirectToSignIn();
    }
  }
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Bypass Clerk for Vercel cron requests to the Haikubox sync endpoint.
  // Vercel auto-injects `Authorization: Bearer <CRON_SECRET>` which Clerk
  // rejects as an invalid JWT (401) before the route handler ever executes.
  // By bypassing Clerk here, the route handler receives the Authorization
  // header intact and verifies it against CRON_SECRET in isCronRequest().
  if (
    request.nextUrl.pathname === '/api/haikubox/sync' &&
    request.headers.get('user-agent')?.includes('vercel-cron')
  ) {
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
