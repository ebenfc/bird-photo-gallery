"use client";

import Button from "@/components/ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  onAssign: () => void;
  onCancel: () => void;
  isAssigning?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onAssign,
  onCancel,
  isAssigning = false,
}: BulkActionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Bulk photo actions"
      className="fixed bottom-0 left-0 right-0 z-40
        bg-[var(--card-bg)]/95 backdrop-blur-md
        border-t border-[var(--border)]
        shadow-[0_-4px_24px_rgba(0,0,0,0.1)]
        animate-fade-in-up"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2" aria-live="polite">
          <svg className="w-5 h-5 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {selectedCount} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onAssign}
            disabled={isAssigning || selectedCount === 0}
          >
            {isAssigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              "Assign Species"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isAssigning}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
