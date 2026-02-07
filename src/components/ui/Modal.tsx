"use client";

import { useEffect, useCallback, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  children,
  size = "lg",
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--forest-950)]/85 to-[var(--mist-900)]/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal container with elegant entrance */}
      <div
        className={`
          relative bg-[var(--card-bg)] rounded-[var(--radius-2xl)] w-full ${sizes[size]} max-h-[90vh] overflow-hidden
          shadow-[var(--shadow-2xl)]
          border border-[var(--mist-100)]
          animate-fade-in-scale
        `}
      >
        {/* Elegant top border accent with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--forest-500)] via-[var(--moss-400)] to-[var(--forest-500)] rounded-t-[var(--radius-2xl)]" />

        {/* Content wrapper with subtle inner shadow */}
        <div className="overflow-auto max-h-[90vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
