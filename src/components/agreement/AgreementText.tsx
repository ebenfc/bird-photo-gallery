export default function AgreementText() {
  return (
    <>
      <h2 className="text-base font-bold text-[var(--text-primary)]">
        Bird Feed User Agreement
      </h2>
      <p className="text-xs text-[var(--mist-500)]">
        Effective Date: February 2026 | Version 1
      </p>

      <p>
        Welcome to Bird Feed! By creating an account and using this service, you agree
        to the following terms. Please read them carefully.
      </p>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-4">
        1. Photo Ownership &amp; Rights
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          You retain full ownership of all photos you upload to Bird Feed.
        </li>
        <li>
          By uploading photos, you confirm that you are the original photographer
          or have the right to share them.
        </li>
        <li>
          You grant Bird Feed a limited license to store, display, and process your
          photos solely for the purpose of providing the service to you.
        </li>
        <li>
          If you enable the public gallery feature, your photos will be viewable by
          anyone with your public profile link.
        </li>
        <li>
          Bird Feed will not sell, license, or use your photos for any commercial
          purpose beyond operating this service.
        </li>
        <li>
          You may delete your photos at any time. Deleted photos are permanently
          removed from our storage.
        </li>
      </ul>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-4">
        2. Data &amp; Privacy
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Bird Feed collects only the data necessary to operate the service: your
          account information (name, email), photos, species data, and device
          configuration.
        </li>
        <li>
          Your account is managed through Clerk, a third-party authentication
          provider. Their privacy policy governs how your login credentials are
          stored.
        </li>
        <li>
          Photos are stored in Supabase cloud storage. Your data is hosted on
          infrastructure provided by Railway and Supabase.
        </li>
        <li>We do not sell your personal data to third parties.</li>
        <li>
          All user data is isolated by account. Other users cannot access your
          data unless you enable the public gallery feature.
        </li>
        <li>
          If you choose to connect a Haikubox device, bird detection data from
          your device is synced and stored in your account.
        </li>
        <li>
          You may request deletion of your account and all associated data at any
          time by contacting us.
        </li>
      </ul>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-4">
        3. Acceptable Use
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Bird Feed is intended for bird photography and related nature content.
        </li>
        <li>
          You agree not to upload content that is illegal, harmful, or unrelated
          to the purpose of the service.
        </li>
        <li>
          You agree not to attempt to access other users&apos; data or disrupt the
          service.
        </li>
        <li>
          Accounts that violate these terms may be suspended or deleted.
        </li>
      </ul>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-4">
        4. Service &amp; Availability
      </h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Bird Feed is a hobby project provided as-is, without warranty of any
          kind.
        </li>
        <li>
          We do not guarantee uptime, data retention, or continued availability
          of the service.
        </li>
        <li>
          We recommend keeping local copies of any photos you consider important.
        </li>
        <li>
          We reserve the right to modify or discontinue the service at any time.
        </li>
      </ul>

      <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-4">
        5. Changes to This Agreement
      </h3>
      <p>
        We may update this agreement from time to time. If we make significant
        changes, you will be asked to review and accept the updated agreement
        before continuing to use Bird Feed.
      </p>

      <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
        <p className="text-xs text-[var(--mist-500)]">
          By clicking &quot;I Accept&quot; below, you acknowledge that you have
          read and agree to these terms.
        </p>
      </div>
    </>
  );
}
