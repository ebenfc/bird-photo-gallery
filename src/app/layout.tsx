import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { hasAcceptedCurrentAgreement } from "@/lib/agreement";
import { getUserByClerkId } from "@/lib/user";
import AgreementForm from "@/components/agreement/AgreementForm";
import DisplayNameGate from "@/components/onboarding/DisplayNameGate";
import { ToastProvider } from "@/components/ui/Toast";
import ReportIssueButton from "@/components/support/ReportIssueButton";
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
              !hasAcceptedAgreement ? (
                // User is authenticated but hasn't accepted — show agreement gate
                <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
                  <div className="w-full max-w-2xl">
                    <AgreementForm />
                  </div>
                </div>
              ) : !hasDisplayName ? (
                // User accepted agreement but needs a display name
                <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
                  <div className="w-full max-w-lg">
                    <DisplayNameGate />
                  </div>
                </div>
              ) : (
                // Onboarding complete — show full app
                <ToastProvider>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[var(--card-bg)] focus:text-black focus:rounded"
                  >
                    Skip to content
                  </a>
                  <Header />
                  <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {children}
                  </main>
                  <ReportIssueButton />
                </ToastProvider>
              )
            ) : (
              // Not authenticated — landing page, sign-in, sign-up get full-width layout
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
