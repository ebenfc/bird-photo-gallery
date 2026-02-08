"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicGallerySettings from "@/components/settings/PublicGallerySettings";
import LocationSettings from "@/components/settings/LocationSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";

export default function SettingsPage() {
  // Haikubox connection form state
  const [haikuboxSerial, setHaikuboxSerial] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showSyncOption, setShowSyncOption] = useState(false);

  // Load existing serial on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.haikuboxSerial) {
          setHaikuboxSerial(data.haikuboxSerial);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/haikubox/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: haikuboxSerial }),
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          success: true,
          message: `✓ Connected to ${data.deviceName}`,
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || "Connection failed",
        });
      }
    } catch (_error) {
      setTestStatus({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haikuboxSerial }),
      });
      const data = await res.json();

      if (data.success) {
        setSaveStatus("✓ Settings saved successfully!");
        setShowSyncOption(true);
      } else {
        setSaveStatus(data.error || "Failed to save");
      }
    } catch (_error) {
      setSaveStatus("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/haikubox/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus(`✓ Synced! Found ${data.processed} species.`);
      } else {
        setSaveStatus("Sync failed — your data will sync automatically within 24 hours.");
      }
    } catch {
      setSaveStatus("Sync failed — your data will sync automatically within 24 hours.");
    } finally {
      setSyncing(false);
      setShowSyncOption(false);
    }
  };

  return (
    <div className="pnw-texture min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-[var(--mist-600)]">
            Customize your Bird Feed experience.
          </p>
        </div>

        {/* Public Gallery Section */}
        <section className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
          border border-[var(--border-light)] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[var(--surface-moss)] to-[var(--surface-forest)]
            border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Public Gallery
            </h2>
            <p className="text-sm sm:text-base text-[var(--mist-600)]">
              Share your bird feed with friends and followers
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <PublicGallerySettings />
          </div>
        </section>

        {/* Location & Directory Section */}
        <section className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
          border border-[var(--border-light)] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[var(--surface-moss)] to-[var(--surface-forest)]
            border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h2>
            <p className="text-sm sm:text-base text-[var(--mist-600)]">
              Set your location for the Discover directory
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <LocationSettings />
          </div>
        </section>

        {/* Haikubox Section */}
        <section className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
          border border-[var(--border-light)] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[var(--surface-moss)] to-[var(--surface-forest)]
            border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Haikubox
            </h2>
            <p className="text-sm sm:text-base text-[var(--mist-600)]">
              Connect your Haikubox for automatic bird detection
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Haikubox Serial Number
                </label>
                <input
                  type="text"
                  value={haikuboxSerial}
                  onChange={(e) => setHaikuboxSerial(e.target.value)}
                  placeholder="e.g., 1000000066e59043"
                  className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
                    text-[var(--text-primary)] bg-[var(--card-bg)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
                    transition-all duration-[var(--timing-fast)]"
                />
                <p className="text-xs text-[var(--mist-600)] mt-1.5">
                  Find your serial number on your Haikubox device or in the Haikubox app.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={!haikuboxSerial || testing}
                  className="px-4 py-2.5 border-2 border-[var(--moss-600)] text-[var(--moss-700)]
                    rounded-[var(--radius-md)] font-medium
                    hover:bg-[var(--surface-moss)] disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-[var(--timing-fast)] active:scale-95"
                >
                  {testing ? "Testing..." : "Test Connection"}
                </button>

                <button
                  onClick={handleSave}
                  disabled={!haikuboxSerial || saving || !testStatus?.success}
                  className="px-4 py-2.5 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
                    text-white rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-sm)]
                    hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-[var(--timing-fast)] active:scale-95"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {testStatus && (
                <div className={`p-3 rounded-[var(--radius-md)] text-sm font-medium ${
                  testStatus.success
                    ? "bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]"
                    : "bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]"
                }`}>
                  {testStatus.message}
                </div>
              )}

              {saveStatus && (
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-border)] text-sm font-medium">
                  {saveStatus}
                  {showSyncOption && (
                    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <button
                        onClick={handleSyncNow}
                        disabled={syncing}
                        className="text-[var(--moss-700)] underline hover:text-[var(--moss-800)] font-semibold disabled:opacity-50"
                      >
                        {syncing ? "Syncing..." : "Sync data now"}
                      </button>
                      <span className="text-[var(--mist-400)]">or</span>
                      <Link
                        href="/activity"
                        className="text-[var(--moss-700)] underline hover:text-[var(--moss-800)] font-semibold"
                      >
                        Go to Activity page
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
          border border-[var(--border-light)] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[var(--surface-moss)] to-[var(--surface-forest)]
            border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Appearance
            </h2>
            <p className="text-sm sm:text-base text-[var(--mist-600)]">
              Choose how Bird Feed looks for you
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <AppearanceSettings />
          </div>
        </section>
    </div>
  );
}
