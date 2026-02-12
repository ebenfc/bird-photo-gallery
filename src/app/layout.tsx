import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { hasAcceptedCurrentAgreement } from "@/lib/agreement";
import { getUserByClerkId } from "@/lib/user";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import SentryUserIdentifier from "@/components/SentryUserIdentifier";
import ThemeProvider from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bird Feed - Catalog Your Bird Photos",
  description: "A simple site for birders to feature their favorite photos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force dynamic rendering — this layout reads auth state and must not be
  // statically pre-rendered at build time (ClerkProvider needs env vars).
  await connection();

  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Middleware didn't run for this route (e.g., static file paths like
    // /_vercel/insights/script.js). Treat as unauthenticated.
    userId = null;
  }
  const isAuthenticated = !!userId;

  // Check if the authenticated user has completed onboarding
  let hasAcceptedAgreement = false;
  let hasDisplayName = false;
  if (isAuthenticated) {
    try {
      hasAcceptedAgreement = await hasAcceptedCurrentAgreement(userId!);
      if (hasAcceptedAgreement) {
        const user = await getUserByClerkId(userId!);
        hasDisplayName = !!user?.displayName;
      }
    } catch {
      // If check fails (e.g., user not in DB yet), treat as not accepted.
      // They'll see the agreement page and can accept once their account
      // is fully created by the Clerk webhook.
      hasAcceptedAgreement = false;
    }
  }

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Prevent flash of wrong skin on page load */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var s=localStorage.getItem("birdfeed-skin");if(s)document.documentElement.setAttribute("data-skin",s)}catch(e){}`,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] min-h-screen paper-texture`}
        >
          <ThemeProvider>
            <SentryUserIdentifier />
            {isAuthenticated ? (
              <AuthenticatedLayout
                hasAcceptedAgreement={hasAcceptedAgreement}
                hasDisplayName={hasDisplayName}
              >
                {children}
              </AuthenticatedLayout>
            ) : (
              <>{children}</>
            )}
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
