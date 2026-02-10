"use client";

import { useState } from "react";
import { generateBirdName } from "@/lib/nameGenerator";

export default function DisplayNameGate() {
  const [name, setName] = useState(() => generateBirdName());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = () => {
    setName(generateBirdName());
  };

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return "Display name must be at least 3 characters";
    if (trimmed.length > 50) return "Display name must be 50 characters or less";
    if (trimmed.includes("@")) return "Display name cannot contain email addresses";
    return null;
  };

  const handleContinue = async () => {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });

      if (res.ok) {
        // Full page reload so layout re-checks displayName
        window.location.href = "/";
        return;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="bg-[var(--card-bg)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-2xl)]
        border border-[var(--mist-100)] overflow-hidden"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--forest-500)] via-[var(--moss-400)] to-[var(--forest-500)]" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Choose a Display Name
          </h1>
          <p className="text-[var(--mist-600)]">
            Bird Feed uses display names to protect your privacy.
            This is how other birders will see you.
          </p>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Your display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={50}
            className="w-full px-4 py-3 border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-[var(--text-primary)] bg-[var(--card-bg)] text-lg
              focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
              transition-all duration-[var(--timing-fast)]"
          />
        </div>

        {/* Suggest button */}
        <button
          type="button"
          onClick={handleSuggest}
          className="mb-6 text-sm font-medium text-[var(--forest-600)] hover:text-[var(--moss-600)]
            transition-colors duration-[var(--timing-fast)]"
        >
          Suggest a different name
        </button>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--error-bg)] text-[var(--error-text)]
              border border-[var(--error-border)] text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={saving || !name.trim()}
          className="w-full py-3 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
            text-white rounded-[var(--radius-md)] font-semibold shadow-[var(--shadow-sm)]
            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Continue"}
        </button>

        <p className="text-xs text-[var(--mist-500)] text-center mt-3">
          You can change this later in Settings.
        </p>
      </div>
    </div>
  );
}
