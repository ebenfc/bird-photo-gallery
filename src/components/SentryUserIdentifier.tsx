"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

/**
 * Invisible component that links the current Clerk user to Sentry.
 * When an error occurs, Sentry will include the user's ID, email,
 * and username so you can see exactly who was affected.
 *
 * Also sets a "page" tag so you can filter errors by route.
 * Renders nothing — it only runs side-effects.
 */
export default function SentryUserIdentifier() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username ?? undefined,
      });
    } else {
      // User signed out — clear Sentry user context so subsequent
      // events aren't attributed to the previous user.
      Sentry.setUser(null);
    }
  }, [user, isLoaded]);

  // Set the current route as a tag so you can filter errors by page
  useEffect(() => {
    Sentry.setTag("page", pathname);
  }, [pathname]);

  return null;
}
