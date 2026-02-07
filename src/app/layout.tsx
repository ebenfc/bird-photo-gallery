import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/layout/Header";
import { hasAcceptedCurrentAgreement } from "@/lib/agreement";
import AgreementForm from "@/components/agreement/AgreementForm";
import { ToastProvider } from "@/components/ui/Toast";
import ReportIssueButton from "@/components/support/ReportIssueButton";
import SentryUserIdentifier from "@/components/SentryUserIdentifier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bird Feed - Catalogue Your Bird Photography",
  description: "A simple, focused tool for birders to catalogue their favorite bird photos and organize them by species.",
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

  // Check if the authenticated user has accepted the current agreement
  let hasAcceptedAgreement = false;
  if (isAuthenticated) {
    try {
      hasAcceptedAgreement = await hasAcceptedCurrentAgreement(userId!);
    } catch {
      // If check fails (e.g., user not in DB yet), treat as not accepted.
      // They'll see the agreement page and can accept once their account
      // is fully created by the Clerk webhook.
      hasAcceptedAgreement = false;
    }
  }

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] min-h-screen paper-texture`}
        >
          <SentryUserIdentifier />
          {isAuthenticated ? (
            hasAcceptedAgreement ? (
              // User is authenticated and has accepted the agreement — show full app
              <ToastProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
                >
                  Skip to content
                </a>
                <Header />
                <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  {children}
                </main>
                <ReportIssueButton />
              </ToastProvider>
            ) : (
              // User is authenticated but hasn't accepted — show agreement gate
              <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-2xl">
                  <AgreementForm />
                </div>
              </div>
            )
          ) : (
            // Not authenticated — landing page, sign-in, sign-up get full-width layout
            <>{children}</>
          )}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
