"use client";

import { useEffect, useCallback, useRef, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  size = "lg",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap: keep Tab/Shift+Tab within the modal
  const handleTabTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Remember the element that opened the modal so we can return focus later
      triggerRef.current = document.activeElement;

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTabTrap);
      document.body.style.overflow = "hidden";

      // Move focus into the modal on next frame
      requestAnimationFrame(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      });
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabTrap);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape, handleTabTrap]);

  // Return focus to the trigger element when modal closes
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
      triggerRef.current = null;
    }
  }, [isOpen]);

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
        aria-hidden="true"
      />

      {/* Modal container with elegant entrance */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        tabIndex={-1}
        className={`
          relative bg-[var(--card-bg)] rounded-[var(--radius-2xl)] w-full ${sizes[size]} max-h-[90vh] overflow-hidden
          shadow-[var(--shadow-2xl)]
          border border-[var(--mist-100)]
          animate-fade-in-scale
          focus:outline-none
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
