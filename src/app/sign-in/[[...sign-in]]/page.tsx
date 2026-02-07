import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="pnw-texture min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome to Bird Feed
          </h1>
          <p className="text-[var(--mist-600)]">
            Sign in to access your bird photo collection
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-[var(--shadow-lg)] rounded-[var(--radius-2xl)]",
            },
          }}
        />
      </div>
    </div>
  );
}
