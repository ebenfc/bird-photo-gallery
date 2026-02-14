"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// --- Constants ---

/** Minimum zoom level (1 = no zoom) */
const MIN_ZOOM = 1;

/** Maximum zoom level */
const MAX_ZOOM = 4;

/** Zoom level for double-tap */
const DOUBLE_TAP_ZOOM = 2.5;

/** Maximum time between taps to count as double-tap (ms) */
const DOUBLE_TAP_THRESHOLD_MS = 300;

/** Maximum distance between taps to count as double-tap (px) */
const DOUBLE_TAP_DISTANCE = 30;

/** Maximum touch duration to qualify as a tap for double-tap detection (ms) */
const TAP_MAX_DURATION = 300;

/** Maximum movement during tap for double-tap detection (px) */
const TAP_MAX_MOVEMENT = 10;

/** Duration for spring-back and zoom animations (ms) */
export const ZOOM_ANIMATION_DURATION = 300;

/** Dead zone before committing to a pan gesture (px) */
const PAN_DEAD_ZONE = 5;

// --- Types ---

export interface PinchZoomConfig {
  /** Ref to the container element that receives touch events */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Whether pinch zoom is enabled */
  enabled: boolean;
  /** Called when zoom level settles after a gesture */
  onZoomChange?: (scale: number) => void;
  /** Changes when the target changes (e.g. photo ID) to force reset */
  viewId?: string | number;
}

export interface PinchZoomState {
  /** Current zoom scale (1 = no zoom) */
  scale: number;
  /** Horizontal pan offset (px) */
  translateX: number;
  /** Vertical pan offset (px) */
  translateY: number;
  /** Whether a spring-back/zoom animation is running */
  isAnimating: boolean;
  /** Whether the image is currently zoomed beyond 1x */
  isZoomed: boolean;
}

// --- Pure math helpers ---

/** Euclidean distance between two points */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Midpoint between two points */
function midpoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { x: number; y: number } {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

/**
 * Compute the actual rendered image bounds within a container that uses object-contain.
 * Returns the image's position and size relative to the container.
 */
function getRenderedImageBounds(container: HTMLElement): {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
} {
  const containerRect = container.getBoundingClientRect();
  const img = container.querySelector("img");

  if (!img || !img.naturalWidth || !img.naturalHeight) {
    // Fallback: assume image fills container
    return {
      width: containerRect.width,
      height: containerRect.height,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const containerAspect = containerRect.width / containerRect.height;

  let renderedWidth: number;
  let renderedHeight: number;

  if (imgAspect > containerAspect) {
    // Image is wider than container — constrained by width (pillarboxed)
    renderedWidth = containerRect.width;
    renderedHeight = containerRect.width / imgAspect;
  } else {
    // Image is taller than container — constrained by height (letterboxed)
    renderedHeight = containerRect.height;
    renderedWidth = containerRect.height * imgAspect;
  }

  return {
    width: renderedWidth,
    height: renderedHeight,
    offsetX: (containerRect.width - renderedWidth) / 2,
    offsetY: (containerRect.height - renderedHeight) / 2,
  };
}

/**
 * Calculate max pan distances for a given zoom level.
 * At scale=1, pan is 0 (image fits). At scale>1, user can pan to see edges.
 */
function computePanBounds(
  scale: number,
  container: HTMLElement
): { maxX: number; maxY: number } {
  const containerRect = container.getBoundingClientRect();
  const img = getRenderedImageBounds(container);

  // The scaled image dimensions
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;

  // How much the scaled image overflows the container
  const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
  const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

  return { maxX, maxY };
}

/** Clamp pan values to bounds */
function clampPan(
  x: number,
  y: number,
  maxX: number,
  maxY: number
): { x: number; y: number } {
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}

// --- Hook ---

export function usePinchZoom(config: PinchZoomConfig): PinchZoomState {
  const { containerRef, enabled, onZoomChange, viewId } = config;

  // Rendered output state — updated via rAF
  const [renderState, setRenderState] = useState<PinchZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    isAnimating: false,
    isZoomed: false,
  });

  // Animation timeout ref for cleanup
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref for callback
  const onZoomChangeRef = useRef(onZoomChange);
  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  // All mutable gesture state in one ref (zero re-renders during gesture)
  const stateRef = useRef({
    // Current transform state (persists across gestures)
    scale: 1,
    translateX: 0,
    translateY: 0,

    // Pinch tracking
    isPinching: false,
    startDistance: 0,
    startScale: 1,
    startCenterX: 0,
    startCenterY: 0,
    startTranslateX: 0,
    startTranslateY: 0,

    // Pan tracking (single-finger when zoomed)
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panStartTranslateX: 0,
    panStartTranslateY: 0,
    panCommitted: false,

    // Double-tap tracking
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    // Track current touch for tap detection
    touchStartTime: 0,
    touchStartX: 0,
    touchStartY: 0,
    touchMoved: false,

    // Animation
    animFrameId: 0,
    isAnimating: false,
  });

  // Schedule a React re-render (at most once per animation frame)
  const scheduleUpdate = useCallback(() => {
    const s = stateRef.current;
    if (s.animFrameId) return;
    s.animFrameId = requestAnimationFrame(() => {
      s.animFrameId = 0;
      const snap = stateRef.current;
      setRenderState({
        scale: snap.scale,
        translateX: snap.translateX,
        translateY: snap.translateY,
        isAnimating: snap.isAnimating,
        isZoomed: snap.scale > 1.01,
      });
    });
  }, []);

  // Animate to target values
  const animateTo = useCallback(
    (
      targetScale: number,
      targetX: number,
      targetY: number,
      duration: number,
      onComplete?: () => void
    ) => {
      const s = stateRef.current;

      // Check for reduced motion preference
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const actualDuration = prefersReducedMotion ? 0 : duration;

      s.isAnimating = true;
      s.scale = targetScale;
      s.translateX = targetX;
      s.translateY = targetY;
      scheduleUpdate();

      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
      }

      animTimeoutRef.current = setTimeout(() => {
        animTimeoutRef.current = null;
        s.isAnimating = false;
        scheduleUpdate();
        if (onComplete) {
          onComplete();
        }
      }, actualDuration);
    },
    [scheduleUpdate]
  );

  // Reset zoom to 1x (instant, no animation)
  const resetZoom = useCallback(() => {
    const s = stateRef.current;
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
    s.scale = 1;
    s.translateX = 0;
    s.translateY = 0;
    s.isAnimating = false;
    s.isPinching = false;
    s.isPanning = false;
    s.panCommitted = false;
    scheduleUpdate();
    onZoomChangeRef.current?.(1);
  }, [scheduleUpdate]);

  // Reset when viewId changes (e.g. navigated to different photo)
  useEffect(() => {
    resetZoom();
  }, [viewId, resetZoom]);

  // Attach touch listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const s = stateRef.current;

      if (e.touches.length >= 2) {
        // --- Pinch start ---
        // Cancel any running animation
        if (s.isAnimating) {
          if (animTimeoutRef.current) {
            clearTimeout(animTimeoutRef.current);
            animTimeoutRef.current = null;
          }
          s.isAnimating = false;
        }

        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;

        s.isPinching = true;
        s.isPanning = false;
        s.panCommitted = false;
        s.startDistance = distance(t1.clientX, t1.clientY, t2.clientX, t2.clientY);
        s.startScale = s.scale;
        s.startTranslateX = s.translateX;
        s.startTranslateY = s.translateY;

        const center = midpoint(t1.clientX, t1.clientY, t2.clientX, t2.clientY);
        s.startCenterX = center.x;
        s.startCenterY = center.y;

        e.preventDefault();
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]!;

        // Record for tap/double-tap detection
        s.touchStartTime = Date.now();
        s.touchStartX = touch.clientX;
        s.touchStartY = touch.clientY;
        s.touchMoved = false;

        // If zoomed, prepare for pan
        if (s.scale > 1.01) {
          // Cancel any running animation
          if (s.isAnimating) {
            if (animTimeoutRef.current) {
              clearTimeout(animTimeoutRef.current);
              animTimeoutRef.current = null;
            }
            s.isAnimating = false;
          }

          s.isPanning = true;
          s.panCommitted = false;
          s.panStartX = touch.clientX;
          s.panStartY = touch.clientY;
          s.panStartTranslateX = s.translateX;
          s.panStartTranslateY = s.translateY;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const s = stateRef.current;

      if (s.isPinching && e.touches.length >= 2) {
        // --- Pinch move ---
        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;

        const currentDistance = distance(t1.clientX, t1.clientY, t2.clientX, t2.clientY);
        const currentCenter = midpoint(t1.clientX, t1.clientY, t2.clientX, t2.clientY);

        // Compute new scale
        const scaleRatio = currentDistance / s.startDistance;
        // Allow slight over-zoom/under-zoom for elastic feel, clamp on release
        const newScale = Math.max(0.5, Math.min(MAX_ZOOM * 1.2, s.startScale * scaleRatio));

        // Focal-point zoom: adjust translation so the pinch center stays fixed.
        // The pinch center in container-relative coordinates moves; we need to
        // offset the translation so that the content under the center doesn't drift.
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          // Pinch center relative to container center
          const cx = s.startCenterX - rect.left - rect.width / 2;
          const cy = s.startCenterY - rect.top - rect.height / 2;

          // How much the center moved (user dragging both fingers)
          const centerDeltaX = currentCenter.x - s.startCenterX;
          const centerDeltaY = currentCenter.y - s.startCenterY;

          // Focal-point transform: the content point under the pinch center should stay put.
          // newTranslate = startTranslate - cx * (newScale/startScale - 1) + centerDelta
          s.translateX =
            s.startTranslateX - cx * (newScale / s.startScale - 1) + centerDeltaX;
          s.translateY =
            s.startTranslateY - cy * (newScale / s.startScale - 1) + centerDeltaY;
        }

        s.scale = newScale;
        e.preventDefault();
        scheduleUpdate();
        return;
      }

      if (s.isPanning && e.touches.length === 1) {
        // --- Pan move ---
        const touch = e.touches[0]!;
        const dx = touch.clientX - s.panStartX;
        const dy = touch.clientY - s.panStartY;

        // Check dead zone before committing
        if (!s.panCommitted) {
          if (Math.abs(dx) > PAN_DEAD_ZONE || Math.abs(dy) > PAN_DEAD_ZONE) {
            s.panCommitted = true;
            s.touchMoved = true;
          } else {
            return;
          }
        }

        s.touchMoved = true;

        const container = containerRef.current;
        if (container) {
          const bounds = computePanBounds(s.scale, container);
          const clamped = clampPan(
            s.panStartTranslateX + dx,
            s.panStartTranslateY + dy,
            bounds.maxX,
            bounds.maxY
          );
          s.translateX = clamped.x;
          s.translateY = clamped.y;
        } else {
          s.translateX = s.panStartTranslateX + dx;
          s.translateY = s.panStartTranslateY + dy;
        }

        e.preventDefault();
        scheduleUpdate();
        return;
      }

      // Track movement for tap detection even if not panning/pinching
      if (e.touches.length === 1) {
        const touch = e.touches[0]!;
        const dx = touch.clientX - s.touchStartX;
        const dy = touch.clientY - s.touchStartY;
        if (Math.abs(dx) > TAP_MAX_MOVEMENT || Math.abs(dy) > TAP_MAX_MOVEMENT) {
          s.touchMoved = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const s = stateRef.current;

      if (s.isPinching) {
        // If fingers are still down, keep tracking
        if (e.touches.length >= 2) return;

        // Pinch ended
        s.isPinching = false;

        // Clamp scale and pan with spring-back animation
        let targetScale = s.scale;
        if (targetScale < MIN_ZOOM) {
          targetScale = MIN_ZOOM;
        } else if (targetScale > MAX_ZOOM) {
          targetScale = MAX_ZOOM;
        }

        const container = containerRef.current;
        let targetX = s.translateX;
        let targetY = s.translateY;

        if (container) {
          const bounds = computePanBounds(targetScale, container);
          const clamped = clampPan(s.translateX, s.translateY, bounds.maxX, bounds.maxY);
          targetX = clamped.x;
          targetY = clamped.y;
        }

        // If returning to 1x, also center
        if (targetScale <= MIN_ZOOM) {
          targetScale = MIN_ZOOM;
          targetX = 0;
          targetY = 0;
        }

        const needsAnimation =
          Math.abs(targetScale - s.scale) > 0.01 ||
          Math.abs(targetX - s.translateX) > 1 ||
          Math.abs(targetY - s.translateY) > 1;

        if (needsAnimation) {
          animateTo(targetScale, targetX, targetY, ZOOM_ANIMATION_DURATION, () => {
            onZoomChangeRef.current?.(targetScale);
          });
        } else {
          s.scale = targetScale;
          s.translateX = targetX;
          s.translateY = targetY;
          scheduleUpdate();
          onZoomChangeRef.current?.(targetScale);
        }

        // If one finger remains, set up for pan
        if (e.touches.length === 1 && targetScale > 1.01) {
          const touch = e.touches[0]!;
          s.isPanning = true;
          s.panCommitted = false;
          s.panStartX = touch.clientX;
          s.panStartY = touch.clientY;
          s.panStartTranslateX = targetX;
          s.panStartTranslateY = targetY;
        }
        return;
      }

      if (s.isPanning) {
        s.isPanning = false;
        s.panCommitted = false;

        // Clamp pan to bounds on release
        const container = containerRef.current;
        if (container) {
          const bounds = computePanBounds(s.scale, container);
          const clamped = clampPan(s.translateX, s.translateY, bounds.maxX, bounds.maxY);

          const needsAnimation =
            Math.abs(clamped.x - s.translateX) > 1 ||
            Math.abs(clamped.y - s.translateY) > 1;

          if (needsAnimation) {
            animateTo(s.scale, clamped.x, clamped.y, ZOOM_ANIMATION_DURATION);
          }
        }
      }

      // Double-tap detection (only when all fingers are up)
      if (e.touches.length === 0) {
        const now = Date.now();
        const duration = now - s.touchStartTime;

        // Only count as a tap if it was short and didn't move
        if (duration < TAP_MAX_DURATION && !s.touchMoved) {
          const timeSinceLast = now - s.lastTapTime;
          const distFromLast = distance(
            s.touchStartX,
            s.touchStartY,
            s.lastTapX,
            s.lastTapY
          );

          if (
            timeSinceLast < DOUBLE_TAP_THRESHOLD_MS &&
            distFromLast < DOUBLE_TAP_DISTANCE
          ) {
            // Double-tap detected!
            s.lastTapTime = 0; // Reset so third tap doesn't re-trigger
            handleDoubleTap(s.touchStartX, s.touchStartY);
            return;
          }

          // Record this tap for potential double-tap
          s.lastTapTime = now;
          s.lastTapX = s.touchStartX;
          s.lastTapY = s.touchStartY;
        }
      }
    };

    const handleDoubleTap = (clientX: number, clientY: number) => {
      const s = stateRef.current;
      const container = containerRef.current;
      if (!container) return;

      if (s.scale > 1.01) {
        // Already zoomed → animate back to 1x
        animateTo(1, 0, 0, ZOOM_ANIMATION_DURATION, () => {
          onZoomChangeRef.current?.(1);
        });
      } else {
        // At 1x → zoom to DOUBLE_TAP_ZOOM centered on tap point
        const rect = container.getBoundingClientRect();

        // Tap position relative to container center
        const relX = clientX - rect.left - rect.width / 2;
        const relY = clientY - rect.top - rect.height / 2;

        // Pan offset to keep the tapped point centered after zoom
        // When we scale by DOUBLE_TAP_ZOOM, the point at (relX, relY) moves to
        // (relX * DOUBLE_TAP_ZOOM, relY * DOUBLE_TAP_ZOOM). To keep it where
        // the user tapped, we translate by -(relX * (zoom - 1), relY * (zoom - 1)).
        const panX = -relX * (DOUBLE_TAP_ZOOM - 1);
        const panY = -relY * (DOUBLE_TAP_ZOOM - 1);

        // Clamp to bounds
        const bounds = computePanBounds(DOUBLE_TAP_ZOOM, container);
        const clamped = clampPan(panX, panY, bounds.maxX, bounds.maxY);

        animateTo(DOUBLE_TAP_ZOOM, clamped.x, clamped.y, ZOOM_ANIMATION_DURATION, () => {
          onZoomChangeRef.current?.(DOUBLE_TAP_ZOOM);
        });
      }
    };

    const handleTouchCancel = () => {
      const s = stateRef.current;
      s.isPinching = false;
      s.isPanning = false;
      s.panCommitted = false;

      // If zoomed, clamp; if not, reset
      if (s.scale > 1.01) {
        const container = containerRef.current;
        if (container) {
          const targetScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.scale));
          const bounds = computePanBounds(targetScale, container);
          const clamped = clampPan(s.translateX, s.translateY, bounds.maxX, bounds.maxY);
          animateTo(targetScale, clamped.x, clamped.y, ZOOM_ANIMATION_DURATION);
        }
      } else {
        animateTo(1, 0, 0, ZOOM_ANIMATION_DURATION, () => {
          onZoomChangeRef.current?.(1);
        });
      }
    };

    // Use passive: false for touchstart and touchmove to allow preventDefault
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true });

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
  }, [containerRef, enabled, viewId, scheduleUpdate, animateTo, resetZoom]);

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
