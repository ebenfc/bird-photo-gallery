"use client";

import { useEffect, useRef } from "react";

/**
 * Triggers a callback when a sentinel element enters the viewport,
 * enabling infinite scroll. Uses IntersectionObserver with a configurable
 * root margin so loading begins before the user reaches the bottom.
 *
 * Usage:
 *   const sentinelRef = useInfiniteScroll({ onLoadMore, hasMore, loading });
 *   return <div ref={sentinelRef} className="h-1" aria-hidden="true" />;
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  rootMargin = "200px",
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, loading, rootMargin]);

  return sentinelRef;
}
