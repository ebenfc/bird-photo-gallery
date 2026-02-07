"use client";

import { useState, useEffect, useCallback } from "react";

interface ProfileSettings {
  username: string | null;
  isPublicGalleryEnabled: boolean;
  isDirectoryListed: boolean;
  displayName: string | null;
}

export default function PublicGallerySettings() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [isPublicEnabled, setIsPublicEnabled] = useState(false);
  const [isDirectoryListed, setIsDirectoryListed] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    error?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          setUsername(data.username || "");
          setIsPublicEnabled(data.isPublicGalleryEnabled);
          setIsDirectoryListed(data.isDirectoryListed);
        }
      } catch (error) {
        console.error("Failed to load profile settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Check username availability (debounced)
  const checkUsername = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await fetch(
        `/api/settings/profile/check-username?username=${encodeURIComponent(value)}`
      );
      if (!res.ok) {
        // API error (e.g., database not migrated yet)
        setUsernameStatus({
          available: false,
          error: "Unable to check availability. Please try again later.",
        });
        return;
      }
      const data = await res.json();
      setUsernameStatus({
        available: data.available,
        error: data.error,
      });
    } catch (error) {
      console.error("Failed to check username:", error);
      setUsernameStatus({
        available: false,
        error: "Unable to check availability. Please try again later.",
      });
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Debounce username check
  useEffect(() => {
    // Don't check if username hasn't changed from saved value
    if (username === settings?.username) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsername(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, settings?.username, checkUsername]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || null,
          isPublicGalleryEnabled: isPublicEnabled,
          isDirectoryListed,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                username: data.username,
                isPublicGalleryEnabled: data.isPublicGalleryEnabled,
                isDirectoryListed: data.isDirectoryListed,
              }
            : null
        );
        setUsernameStatus(null);
        setSaveMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!settings?.username) return;

    const url = `${window.location.origin}/u/${settings.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const publicUrl = username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`
    : null;

  const hasChanges =
    username !== (settings?.username || "") ||
    isPublicEnabled !== settings?.isPublicGalleryEnabled ||
    isDirectoryListed !== settings?.isDirectoryListed;

  const canSave =
    hasChanges &&
    !saving &&
    !checkingUsername &&
    (usernameStatus === null || usernameStatus.available || username === settings?.username);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-[var(--mist-100)] rounded-[var(--radius-md)]" />
        <div className="h-10 bg-[var(--mist-100)] rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Username Input */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mist-400)]">
            /u/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="your-username"
            maxLength={30}
            className={`w-full pl-10 pr-10 py-2.5 border rounded-[var(--radius-md)]
              text-[var(--text-primary)] bg-[var(--card-bg)]
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all duration-[var(--timing-fast)]
              ${
                usernameStatus?.error
                  ? "border-red-300 focus:ring-red-500"
                  : usernameStatus?.available
                  ? "border-green-300 focus:ring-green-500"
                  : "border-[var(--border-light)] focus:ring-[var(--moss-500)]"
              }`}
          />
          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername && (
              <svg
                className="w-5 h-5 text-[var(--mist-400)] animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {!checkingUsername && usernameStatus?.available && (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {!checkingUsername && usernameStatus?.error && (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        {usernameStatus?.error && (
          <p className="text-xs text-red-600 mt-1.5">{usernameStatus.error}</p>
        )}
        {usernameStatus?.available && (
          <p className="text-xs text-green-600 mt-1.5">Username is available!</p>
        )}
        <p className="text-xs text-[var(--mist-500)] mt-1.5">
          3-30 characters. Letters, numbers, and hyphens only.
        </p>
        <p className="text-xs text-[var(--mist-400)] mt-1">
          Tip: For privacy, avoid using your real name or email address.
        </p>
      </div>

      {/* Public Gallery Toggle */}
      <div className="flex items-center justify-between py-3 px-4 bg-[var(--mist-50)] rounded-[var(--radius-md)]">
        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">
            Make my feed public
          </label>
          <p className="text-xs text-[var(--mist-500)] mt-0.5">
            Anyone with the link can view your photos and species
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublicEnabled}
          onClick={() => {
            const newValue = !isPublicEnabled;
            setIsPublicEnabled(newValue);
            if (!newValue) setIsDirectoryListed(false);
          }}
          disabled={!username && !isPublicEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
            focus:ring-[var(--moss-500)] focus:ring-offset-2
            ${
              isPublicEnabled
                ? "bg-[var(--moss-500)]"
                : "bg-[var(--mist-300)]"
            }
            ${!username && !isPublicEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
              transition duration-200 ease-in-out
              ${isPublicEnabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {/* Directory Listing Toggle (only shown when public gallery is enabled) */}
      {isPublicEnabled && (
        <div className="flex items-center justify-between py-3 px-4 bg-[var(--mist-50)] rounded-[var(--radius-md)]">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              List in Discover directory
            </label>
            <p className="text-xs text-[var(--mist-500)] mt-0.5">
              Let other birders find your gallery by browsing the directory
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDirectoryListed}
            onClick={() => setIsDirectoryListed(!isDirectoryListed)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
              focus:ring-[var(--moss-500)] focus:ring-offset-2 cursor-pointer
              ${
                isDirectoryListed
                  ? "bg-[var(--moss-500)]"
                  : "bg-[var(--mist-300)]"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                transition duration-200 ease-in-out
                ${isDirectoryListed ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      )}

      {/* Public URL Preview */}
      {settings?.username && settings.isPublicGalleryEnabled && (
        <div className="p-4 bg-gradient-to-br from-[var(--surface-moss)] to-[var(--surface-forest)]
          rounded-[var(--radius-md)] border border-[var(--moss-200)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--moss-700)] mb-1">Your public feed</p>
              <p className="text-sm text-[var(--text-label)] font-mono truncate">
                {publicUrl}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-[var(--radius-md)]
                transition-all duration-[var(--timing-fast)]
                ${
                  copied
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-[var(--card-bg)] text-[var(--forest-700)] border border-[var(--border-light)] hover:bg-[var(--mist-50)] hover:border-[var(--moss-300)]"
                }`}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Link
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2.5 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
            text-white rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-sm)]
            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-95"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {saveMessage && (
          <p
            className={`text-sm font-medium ${
              saveMessage.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {saveMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}
