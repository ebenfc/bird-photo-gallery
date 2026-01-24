"use client";

import { createPortal } from "react-dom";
import type { BubbleChartBird } from "@/types";

interface BubbleChartTooltipProps {
  bird: BubbleChartBird | null;
  position: { x: number; y: number };
  visible: boolean;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
}

function adjustTooltipPosition(
  x: number,
  y: number,
  tooltipWidth: number = 200,
  tooltipHeight: number = 100
): { x: number; y: number } {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  let adjustedX = x + 10; // Default offset
  let adjustedY = y + 10;

  // Flip horizontally if too close to right edge
  if (adjustedX + tooltipWidth > viewportWidth) {
    adjustedX = x - tooltipWidth - 10;
  }

  // Flip vertically if too close to bottom
  if (adjustedY + tooltipHeight > viewportHeight) {
    adjustedY = y - tooltipHeight - 10;
  }

  return {
    x: Math.max(10, adjustedX),
    y: Math.max(10, adjustedY),
  };
}

export default function BubbleChartTooltip({
  bird,
  position,
  visible,
}: BubbleChartTooltipProps) {
  // Only render on client side (when document is available)
  if (typeof document === "undefined" || !visible || !bird) return null;

  const adjustedPosition = adjustTooltipPosition(position.x, position.y);

  return createPortal(
    <div
      className="fixed z-50 pointer-events-none transition-opacity duration-150"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-[var(--mist-200)] p-3 max-w-[200px]">
        <div className="font-semibold text-[var(--forest-900)] mb-1">
          {bird.commonName}
        </div>
        <div className="text-sm text-[var(--mist-600)] mb-1">
          Heard {formatCount(bird.yearlyCount)}x this year
        </div>
        <div className={`text-sm font-medium mb-1 ${
          bird.hasPhoto ? "text-[var(--moss-600)]" : "text-[var(--sky-600)]"
        }`}>
          {bird.hasPhoto ? "✓ Photographed" : "📸 Not yet photographed"}
        </div>
        {bird.lastHeardAt && (
          <div className="text-xs text-[var(--mist-500)]">
            Last heard: {getRelativeTime(bird.lastHeardAt)}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
