"use client";

import { useEffect, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

/**
 * Detects the Konami Code keyboard sequence (↑↑↓↓←→←→BA).
 * Fires `onUnlock` once when the full sequence is entered.
 */
export function useKonamiCode(onUnlock: () => void): void {
  const bufferRef = useRef<string[]>([]);
  const hasTriggeredRef = useRef(false);
  const onUnlockRef = useRef(onUnlock);

  // Keep ref in sync with latest callback
  useEffect(() => {
    onUnlockRef.current = onUnlock;
  }, [onUnlock]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasTriggeredRef.current) return;

      const buffer = bufferRef.current;
      buffer.push(e.code);

      // Keep buffer at sequence length
      if (buffer.length > KONAMI_SEQUENCE.length) {
        buffer.shift();
      }

      // Check for match
      if (
        buffer.length === KONAMI_SEQUENCE.length &&
        buffer.every((code, i) => code === KONAMI_SEQUENCE[i])
      ) {
        hasTriggeredRef.current = true;
        onUnlockRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
