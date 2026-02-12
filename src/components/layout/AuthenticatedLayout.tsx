"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import AgreementForm from "@/components/agreement/AgreementForm";
import DisplayNameGate from "@/components/onboarding/DisplayNameGate";
import { ToastProvider } from "@/components/ui/Toast";
import ReportIssueButton from "@/components/support/ReportIssueButton";

const PUBLIC_PREFIXES = ["/u/", "/about"];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  );
}

export default function AuthenticatedLayout({
  hasAcceptedAgreement,
  hasDisplayName,
  children,
}: {
  hasAcceptedAgreement: boolean;
  hasDisplayName: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const onPublicPage = isPublicPage(pathname);
  const onboardingComplete = hasAcceptedAgreement && hasDisplayName;

  // On public pages, never show onboarding gates.
  // If onboarded, show app chrome (Header, nav). Otherwise just the page content.
  if (onPublicPage) {
    if (onboardingComplete) {
      return (
        <AppChrome>
          {children}
        </AppChrome>
      );
    }
    return <>{children}</>;
  }

  // On app pages, enforce onboarding gates
  if (!hasAcceptedAgreement) {
    return (
      <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <AgreementForm />
        </div>
      </div>
    );
  }

  if (!hasDisplayName) {
    return (
      <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <DisplayNameGate />
        </div>
      </div>
    );
  }

  return (
    <AppChrome>
      {children}
    </AppChrome>
  );
}

function AppChrome({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
