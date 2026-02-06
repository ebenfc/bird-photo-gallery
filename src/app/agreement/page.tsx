import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasAcceptedCurrentAgreement } from "@/lib/agreement";
import AgreementForm from "@/components/agreement/AgreementForm";

export const metadata = {
  title: "User Agreement - Bird Feed",
};

export default async function AgreementPage() {
  const { userId } = await auth();

  // Unauthenticated users should sign in first
  if (!userId) {
    redirect("/sign-in");
  }

  // If user has already accepted, send them to the main app
  try {
    const accepted = await hasAcceptedCurrentAgreement(userId);
    if (accepted) {
      redirect("/");
    }
  } catch {
    // If the check fails (e.g., user not in DB yet due to webhook race
    // condition), show the agreement page anyway. The accept API call
    // will handle errors gracefully.
  }

  return (
    <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <AgreementForm />
      </div>
    </div>
  );
}
