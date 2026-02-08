"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// --- Constants ---

/** Dead zone before committing to a gesture direction (px) */
const DEAD_ZONE = 10;

/** Maximum touch duration to qualify as a tap (ms) */
const TAP_MAX_DURATION = 300;

/** Drag distance ratio of container width to trigger navigation */
const DISTANCE_THRESHOLD_RATIO = 0.4;

/** Minimum flick velocity to trigger navigation (px/ms) */
const VELOCITY_THRESHOLD = 0.5;

/** Maximum elastic overshoot as ratio of container width */
const MAX_STRETCH_RATIO = 0.3;

/** Vertical distance to trigger dismiss (px) */
const DISMISS_DISTANCE_THRESHOLD = 150;

/** Minimum vertical flick velocity to trigger dismiss (px/ms) */
const DISMISS_VELOCITY_THRESHOLD = 0.4;

/** Vertical drag range over which opacity fades from 1 → 0.3 (px) */
const DISMISS_OPACITY_RANGE = 200;

/** Duration for spring-back animation (ms) */
export const SPRING_BACK_DURATION = 300;

/** Duration for completion slide-out animation (ms) */
export const COMPLETION_DURATION = 250;

// --- Types ---

type GesturePhase = "idle" | "deciding" | "swiping-x" | "swiping-y";

interface VelocitySample {
  x: number;
  y: number;
  time: number;
}

export interface SwipeGestureConfig {
  /** Ref to the container element that receives touch events */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Called when a horizontal swipe completes navigation */
  onNavigate: (direction: "prev" | "next") => void;
  /** Called when a vertical swipe triggers dismiss */
  onDismiss: () => void;
  /** Called when a touch is determined to be a tap (not a swipe) */
  onTap: () => void;
  /** Whether prev/next navigation is allowed */
  canNavigate: { prev: boolean; next: boolean };
  /** Whether gesture handling is enabled */
  enabled: boolean;
  /** Changes when the container element switches (e.g. fullscreen ↔ detail view) to force listener re-attach */
  viewId?: string | number;
}

export interface SwipeGestureState {
  /** Current X translation of the photo track (px) */
  translateX: number;
  /** Current Y translation for dismiss gesture (px) */
  translateY: number;
  /** Opacity for dismiss gesture (1 = fully visible) */
  dismissOpacity: number;
  /** Whether a spring-back/completion animation is running */
  isAnimating: boolean;
  /** Current gesture phase */
  gesturePhase: GesturePhase;
}

// --- Pure math helpers ---

/** Compute velocity from the last few touch samples */
function computeVelocity(history: VelocitySample[]): { vx: number; vy: number } {
  if (history.length < 2) return { vx: 0, vy: 0 };
  const recent = history.slice(-5);
  const first = recent[0]!;
  const last = recent[recent.length - 1]!;
  const dt = last.time - first.time;
  if (dt === 0) return { vx: 0, vy: 0 };
  return {
    vx: (last.x - first.x) / dt,
    vy: (last.y - first.y) / dt,
  };
}

/** iOS-style logarithmic rubber-band resistance */
function applyElasticResistance(rawDelta: number, maxStretch: number): number {
  const sign = Math.sign(rawDelta);
  const abs = Math.abs(rawDelta);
  return sign * maxStretch * (1 - Math.exp(-abs / maxStretch));
}

// --- Hook ---

export function useSwipeGesture(config: SwipeGestureConfig): SwipeGestureState {
  const { containerRef, onNavigate, onDismiss, onTap, canNavigate, enabled, viewId } = config;

  // Rendered output state — updated via rAF from the internal ref
  const [renderState, setRenderState] = useState<SwipeGestureState>({
    translateX: 0,
    translateY: 0,
    dismissOpacity: 1,
    isAnimating: false,
    gesturePhase: "idle",
  });

  // Container width for threshold calculations
  const containerWidthRef = useRef(0);

  // Animation timeout ref for cleanup
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // All mutable gesture state in one ref (zero re-renders during drag)
  const stateRef = useRef({
    // Touch tracking
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,

    // Velocity ring buffer
    velocityHistory: [] as VelocitySample[],

    // State machine
    phase: "idle" as GesturePhase,

    // Animation
    animFrameId: 0,
    isAnimating: false,

    // Output values
    translateX: 0,
    translateY: 0,
    dismissOpacity: 1,
  });

  // Stable refs for callbacks (avoid re-attaching listeners on every render)
  const onNavigateRef = useRef(onNavigate);
  const onDismissRef = useRef(onDismiss);
  const onTapRef = useRef(onTap);
  const canNavigateRef = useRef(canNavigate);

  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);
  useEffect(() => { onTapRef.current = onTap; }, [onTap]);
  useEffect(() => { canNavigateRef.current = canNavigate; }, [canNavigate]);

  // Schedule a React re-render (at most once per animation frame)
  // Copies mutable ref values to useState for safe rendering
  const scheduleUpdate = useCallback(() => {
    const s = stateRef.current;
    if (s.animFrameId) return;
    s.animFrameId = requestAnimationFrame(() => {
      s.animFrameId = 0;
      const snap = stateRef.current;
      setRenderState({
        translateX: snap.translateX,
        translateY: snap.translateY,
        dismissOpacity: snap.dismissOpacity,
        isAnimating: snap.isAnimating,
        gesturePhase: snap.phase,
      });
    });
  }, []);

  // Reset all gesture state to idle
  const resetState = useCallback(() => {
    const s = stateRef.current;
    s.phase = "idle";
    s.translateX = 0;
    s.translateY = 0;
    s.dismissOpacity = 1;
    s.isAnimating = false;
    s.velocityHistory = [];
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
    scheduleUpdate();
  }, [scheduleUpdate]);

  // Animate to target values via CSS transition (component reads isAnimating to add CSS transition)
  // After the duration, calls onComplete and resets state
  const animateTo = useCallback(
    (targetX: number, targetY: number, targetOpacity: number, duration: number, onComplete?: () => void) => {
      const s = stateRef.current;
      s.isAnimating = true;
      s.translateX = targetX;
      s.translateY = targetY;
      s.dismissOpacity = targetOpacity;
      scheduleUpdate();

      // After the CSS transition completes, fire callback and reset
      animTimeoutRef.current = setTimeout(() => {
        animTimeoutRef.current = null;
        if (onComplete) {
          onComplete();
        }
        resetState();
      }, duration);
    },
    [scheduleUpdate, resetState]
  );

  // Track container width with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidthRef.current = entry.contentRect.width;
      }
    });

    observer.observe(el);
    containerWidthRef.current = el.clientWidth;

    return () => observer.disconnect();
  }, [containerRef, enabled, viewId]);

  // Attach touch listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const s = stateRef.current;

      // If an animation is running, cancel it and start fresh
      if (s.isAnimating) {
        if (animTimeoutRef.current) {
          clearTimeout(animTimeoutRef.current);
          animTimeoutRef.current = null;
        }
        s.isAnimating = false;
      }

      const touch = e.touches[0];
      if (!touch) return;

      s.startX = touch.clientX;
      s.startY = touch.clientY;
      s.currentX = touch.clientX;
      s.currentY = touch.clientY;
      s.startTime = Date.now();
      s.velocityHistory = [{ x: touch.clientX, y: touch.clientY, time: Date.now() }];
      s.phase = "deciding";
      s.translateX = 0;
      s.translateY = 0;
      s.dismissOpacity = 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const s = stateRef.current;
      if (s.phase === "idle") return;

      const touch = e.touches[0];
      if (!touch) return;

      s.currentX = touch.clientX;
      s.currentY = touch.clientY;
      s.velocityHistory.push({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      // Keep only last 10 samples
      if (s.velocityHistory.length > 10) {
        s.velocityHistory = s.velocityHistory.slice(-10);
      }

      const dx = s.currentX - s.startX;
      const dy = s.currentY - s.startY;

      if (s.phase === "deciding") {
        // Check if we've moved past the dead zone
        if (Math.abs(dx) > DEAD_ZONE || Math.abs(dy) > DEAD_ZONE) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            s.phase = "swiping-x";
          } else if (dy > 0) {
            // Only commit to vertical if swiping DOWN
            s.phase = "swiping-y";
          } else {
            // Swiping up — ignore, stay in deciding (will resolve as tap or horizontal)
            return;
          }
        } else {
          return;
        }
      }

      // Prevent browser default (back/forward nav, scroll, pull-to-refresh)
      e.preventDefault();

      if (s.phase === "swiping-x") {
        const canGoPrev = canNavigateRef.current.prev;
        const canGoNext = canNavigateRef.current.next;
        const maxStretch = containerWidthRef.current * MAX_STRETCH_RATIO;

        if ((dx > 0 && !canGoPrev) || (dx < 0 && !canGoNext)) {
          // At boundary — apply elastic resistance
          s.translateX = applyElasticResistance(dx, maxStretch);
        } else {
          // Normal 1:1 tracking
          s.translateX = dx;
        }
        scheduleUpdate();
      } else if (s.phase === "swiping-y") {
        // Only track downward movement (clamp dy >= 0)
        const clampedDy = Math.max(0, dy);
        s.translateY = clampedDy;
        s.dismissOpacity = Math.max(0.3, 1 - clampedDy / DISMISS_OPACITY_RANGE);
        scheduleUpdate();
      }
    };

    const handleTouchEnd = () => {
      const s = stateRef.current;

      if (s.phase === "idle") return;

      const dx = s.currentX - s.startX;
      const dy = s.currentY - s.startY;
      const duration = Date.now() - s.startTime;

      // Tap detection
      if (s.phase === "deciding" || (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE && duration < TAP_MAX_DURATION)) {
        s.phase = "idle";
        onTapRef.current();
        return;
      }

      const { vx, vy } = computeVelocity(s.velocityHistory);
      const containerWidth = containerWidthRef.current || window.innerWidth;

      if (s.phase === "swiping-x") {
        const distanceThreshold = containerWidth * DISTANCE_THRESHOLD_RATIO;
        const shouldNavigatePrev = (dx > distanceThreshold || vx > VELOCITY_THRESHOLD) && canNavigateRef.current.prev;
        const shouldNavigateNext = (dx < -distanceThreshold || vx < -VELOCITY_THRESHOLD) && canNavigateRef.current.next;

        if (shouldNavigateNext) {
          animateTo(-containerWidth, 0, 1, COMPLETION_DURATION, () => {
            onNavigateRef.current("next");
          });
        } else if (shouldNavigatePrev) {
          animateTo(containerWidth, 0, 1, COMPLETION_DURATION, () => {
            onNavigateRef.current("prev");
          });
        } else {
          // Didn't meet threshold — snap back
          animateTo(0, 0, 1, SPRING_BACK_DURATION);
        }
      } else if (s.phase === "swiping-y") {
        const shouldDismiss =
          dy > DISMISS_DISTANCE_THRESHOLD || vy > DISMISS_VELOCITY_THRESHOLD;

        if (shouldDismiss) {
          animateTo(0, window.innerHeight, 0, COMPLETION_DURATION, () => {
            onDismissRef.current();
          });
        } else {
          animateTo(0, 0, 1, SPRING_BACK_DURATION);
        }
      } else {
        // Was in "deciding" but didn't commit — treat as no-op
        resetState();
      }
    };

    const handleTouchCancel = () => {
      const s = stateRef.current;
      if (s.phase !== "idle") {
        animateTo(0, 0, 1, SPRING_BACK_DURATION);
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    // Capture ref value for cleanup (react-hooks/exhaustive-deps)
    const currentState = stateRef.current;

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
      if (currentState.animFrameId) {
        cancelAnimationFrame(currentState.animFrameId);
        currentState.animFrameId = 0;
      }
    };
  }, [containerRef, enabled, viewId, scheduleUpdate, resetState, animateTo]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
      }
    };
  }, []);

  return renderState;
}
