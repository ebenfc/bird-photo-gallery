"use client";

import { useRef, useCallback } from "react";

const TAP_COUNT = 7;
const TAP_WINDOW_MS = 3000;

/**
 * Detects 7 rapid taps within a 3-second window.
 * Returns an onClick handler to attach to the tap target.
 * Taps 1-6 allow normal navigation; tap 7 calls preventDefault + onUnlock.
 */
export function useLogoTapUnlock(
  onUnlock: () => void
): (e: React.MouseEvent) => void {
  const tapsRef = useRef<number[]>([]);
  const hasTriggeredRef = useRef(false);

  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      if (hasTriggeredRef.current) return;

      const now = Date.now();
      tapsRef.current.push(now);
      // Filter to taps within the time window
      tapsRef.current = tapsRef.current.filter(
        (t) => now - t <= TAP_WINDOW_MS
      );

      if (tapsRef.current.length >= TAP_COUNT) {
        hasTriggeredRef.current = true;
        tapsRef.current = [];
        e.preventDefault(); // prevent navigation on the unlock tap
        onUnlock();
      }
    },
    [onUnlock]
  );

  return handleTap;
}
