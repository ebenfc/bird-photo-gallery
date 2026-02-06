"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AgreementText from "./AgreementText";

export default function AgreementForm() {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Enable accept button when user has scrolled within 20px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Refresh the root layout so it re-checks agreement status
        router.refresh();
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to accept agreement. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-[var(--radius-2xl)] shadow-[var(--shadow-2xl)]
        border border-[var(--mist-100)] overflow-hidden"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--forest-500)] via-[var(--moss-400)] to-[var(--forest-500)]" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] mb-2">
            Welcome to Bird Feed
          </h1>
          <p className="text-[var(--mist-600)]">
            Please review and accept our user agreement to continue
          </p>
        </div>

        {/* Scrollable agreement text */}
        <div
          onScroll={handleScroll}
          className="max-h-96 overflow-y-auto border border-[var(--border-light)]
            rounded-[var(--radius-md)] p-5 mb-6 bg-[var(--mist-50)]
            text-sm text-[var(--forest-800)] leading-relaxed space-y-4"
        >
          <AgreementText />
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-red-50 text-red-800
              border border-red-200 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* Accept button */}
        <button
          onClick={handleAccept}
          disabled={accepting || !scrolledToBottom}
          className="w-full py-3 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
            text-white rounded-[var(--radius-md)] font-semibold shadow-[var(--shadow-sm)]
            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-[0.98]"
        >
          {accepting
            ? "Accepting..."
            : scrolledToBottom
              ? "I Accept"
              : "Please scroll to read the full agreement"}
        </button>

        {!scrolledToBottom && (
          <p className="text-xs text-[var(--mist-500)] text-center mt-2">
            Scroll to the bottom of the agreement to enable the accept button
          </p>
        )}
      </div>
    </div>
  );
}
