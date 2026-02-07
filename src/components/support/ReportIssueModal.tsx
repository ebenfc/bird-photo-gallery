"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const ISSUE_TYPES = [
  { value: "bug", label: "Bug", description: "Something isn't working right" },
  {
    value: "feature_request",
    label: "Feature Request",
    description: "I'd like something new",
  },
  {
    value: "question",
    label: "Question",
    description: "I need help with something",
  },
  { value: "other", label: "Other", description: "Something else" },
] as const;

const MAX_DESCRIPTION = 1000;
const MIN_DESCRIPTION = 10;

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The URL of the page the user was on when they opened the modal */
  pageUrl: string;
}

export default function ReportIssueModal({
  isOpen,
  onClose,
  pageUrl,
}: ReportIssueModalProps) {
  const [issueType, setIssueType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIssueType("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!issueType) {
      setError("Please select an issue type");
      return;
    }
    const trimmed = description.trim();
    if (trimmed.length < MIN_DESCRIPTION) {
      setError(`Please provide at least ${MIN_DESCRIPTION} characters`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/support/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          description: trimmed,
          pageUrl,
          userAgent: navigator.userAgent,
        }),
      });

      if (res.ok) {
        showToast("Report submitted — thank you!", "success");
        onClose();
      } else if (res.status === 429) {
        setError(
          "You've submitted several reports recently. Please wait a few minutes."
        );
      } else {
        const data = await res.json().catch(() => null);
        setError(
          data?.error ?? "Failed to submit report. Please try again."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const charsRemaining = MAX_DESCRIPTION - description.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 21v-2a4 4 0 014-4h2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--forest-900)]">
              Report an Issue
            </h2>
            <p className="text-sm text-[var(--mist-500)]">
              Let us know what&apos;s going on
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Issue Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-2">
              What kind of issue? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setIssueType(type.value)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                    issueType === type.value
                      ? "bg-[var(--moss-50)] border-[var(--moss-400)] text-[var(--forest-800)] shadow-sm"
                      : "bg-white border-[var(--mist-200)] text-[var(--mist-600)] hover:border-[var(--mist-300)]"
                  }`}
                >
                  <span className="text-sm font-medium block">
                    {type.label}
                  </span>
                  <span className="text-xs opacity-70">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Description *
            </label>
            <textarea
              placeholder="Describe what happened or what you'd like to see..."
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DESCRIPTION) {
                  setDescription(e.target.value);
                }
              }}
              rows={4}
              className="block w-full px-4 py-2.5 border border-[var(--mist-200)] rounded-xl shadow-sm
                bg-white text-[var(--foreground)] placeholder-[var(--mist-400)]
                focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:border-[var(--moss-400)]
                hover:border-[var(--mist-300)] transition-colors text-sm resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-[var(--mist-400)]">
                Minimum {MIN_DESCRIPTION} characters
              </p>
              <p
                className={`text-xs ${
                  charsRemaining < 50
                    ? "text-amber-500"
                    : "text-[var(--mist-400)]"
                }`}
              >
                {charsRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--mist-100)]">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
