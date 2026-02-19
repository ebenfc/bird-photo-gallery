"use client";

import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

/**
 * Prevents background scrolling when a modal/overlay is open.
 *
 * Uses the "position: fixed" body lock pattern instead of overflow:hidden,
 * which is safe for iOS Safari's virtual keyboard. (overflow:hidden triggers
 * a viewport recalculation that dismisses the keyboard.)
 *
 * Supports nested modals via reference counting — only the last modal
 * to close releases the lock.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;

    if (lockCount === 1) {
      savedScrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    }

    return () => {
      lockCount--;

      if (lockCount === 0) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [isLocked]);
}
