"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BubbleChartBird, BubblePosition } from "@/types";
import BubbleChartTooltip from "./BubbleChartTooltip";

interface BubbleChartProps {
  data: BubbleChartBird[];
}

// Helper functions for bubble layout
function getRadiusFromCount(
  count: number,
  minRadius: number,
  maxRadius: number,
  maxCount: number
): number {
  if (maxCount === 0) return minRadius;

  // Logarithmic scale for better visual distribution
  const logCount = Math.log(count + 1);
  const logMax = Math.log(maxCount + 1);
  const ratio = logCount / logMax;

  return minRadius + (maxRadius - minRadius) * ratio;
}

function checkCollision(
  x: number,
  y: number,
  r: number,
  placed: BubblePosition[]
): boolean {
  const padding = 10; // minimum space between bubbles

  return placed.some((p) => {
    const distance = Math.hypot(x - p.x, y - p.y);
    return distance < r + p.r + padding;
  });
}

function findPosition(
  radius: number,
  minX: number,
  maxX: number,
  height: number,
  placed: BubblePosition[]
): { x: number; y: number } {
  // Try positions in a spiral pattern from center
  const centerX = (minX + maxX) / 2;
  const centerY = height / 2;

  for (let angle = 0; angle < Math.PI * 20; angle += 0.3) {
    for (
      let distance = 0;
      distance < Math.min(maxX - minX, height) / 2;
      distance += 10
    ) {
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Add random jitter for organic appearance
      const jitterX = (Math.random() - 0.5) * 10;
      const jitterY = (Math.random() - 0.5) * 10;

      const finalX = Math.max(
        minX + radius,
        Math.min(maxX - radius, x + jitterX)
      );
      const finalY = Math.max(radius, Math.min(height - radius, y + jitterY));

      if (!checkCollision(finalX, finalY, radius, placed)) {
        return { x: finalX, y: finalY };
      }
    }
  }

  // Fallback if no position found
  return { x: centerX, y: centerY };
}

function calculateBubblePositions(
  birds: BubbleChartBird[],
  width: number,
  height: number
): BubblePosition[] {
  const positions: BubblePosition[] = [];

  // Separate into groups
  const photographed = birds.filter((b) => b.hasPhoto);
  const notYet = birds.filter((b) => !b.hasPhoto);

  // Calculate max count for scaling
  const maxCount = Math.max(...birds.map((b) => b.yearlyCount), 1);
  const minRadius = 20;
  const maxRadius = 80;

  // Place photographed birds in left section (0 to width*0.45)
  photographed.forEach((bird) => {
    const r = getRadiusFromCount(bird.yearlyCount, minRadius, maxRadius, maxCount);
    const pos = findPosition(r, 0, width * 0.45, height, positions);
    positions.push({ ...pos, r, bird });
  });

  // Place not-yet birds in right section (width*0.55 to width)
  notYet.forEach((bird) => {
    const r = getRadiusFromCount(bird.yearlyCount, minRadius, maxRadius, maxCount);
    const pos = findPosition(r, width * 0.55, width, height, positions);
    positions.push({ ...pos, r, bird });
  });

  return positions;
}

export default function BubbleChart({ data }: BubbleChartProps) {
  const router = useRouter();
  const [hoveredBird, setHoveredBird] = useState<BubbleChartBird | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart dimensions
  const width = 800;
  const height = 600;

  // Calculate bubble positions (memoized for performance)
  const positions = useMemo(() => {
    if (!data || data.length === 0) return [];
    return calculateBubblePositions(data, width, height);
  }, [data, width, height]);

  const handleMouseEnter = (bird: BubbleChartBird, e: React.MouseEvent) => {
    setHoveredBird(bird);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredBird) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredBird(null);
  };

  const handleClick = (bird: BubbleChartBird) => {
    router.push(`/species?search=${encodeURIComponent(bird.commonName)}`);
  };

  const handleKeyDown = (bird: BubbleChartBird, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(bird);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-[var(--mist-500)]">
        <div className="text-center">
          <p className="text-lg font-medium">No bird activity data available</p>
          <p className="text-sm mt-1">Sync your Haikubox to see bird detections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: "600px" }}
        role="img"
        aria-label="Bird activity visualization"
      >
        <title>Bird Activity Bubble Chart</title>
        <desc>
          Bubble chart showing visit frequency for {data.length} bird species.
          Bubble size represents detection count. Green bubbles are photographed,
          blue bubbles are not yet photographed.
        </desc>

        {/* Divider line between groups */}
        <line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={height}
          className="stroke-[var(--mist-200)]"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Group labels */}
        <text
          x={width * 0.225}
          y={30}
          textAnchor="middle"
          className="fill-[var(--forest-700)] text-sm font-semibold"
          style={{ fontSize: "16px" }}
        >
          Photographed
        </text>
        <text
          x={width * 0.775}
          y={30}
          textAnchor="middle"
          className="fill-[var(--forest-700)] text-sm font-semibold"
          style={{ fontSize: "16px" }}
        >
          Not Yet
        </text>

        {/* Bubbles */}
        {positions.map((pos, i) => (
          <g key={`${pos.bird.commonName}-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pos.r}
              className={`transition-all duration-200 cursor-pointer
                ${
                  pos.bird.hasPhoto
                    ? "fill-[var(--moss-400)] hover:fill-[var(--moss-500)]"
                    : "fill-[var(--sky-400)] hover:fill-[var(--sky-500)]"
                }
                ${hoveredBird === pos.bird ? "drop-shadow-lg" : ""}
              `}
              style={{
                transform: hoveredBird === pos.bird ? "scale(1.05)" : "scale(1)",
                transformOrigin: `${pos.x}px ${pos.y}px`,
              }}
              onMouseEnter={(e) => handleMouseEnter(pos.bird, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(pos.bird)}
              onKeyDown={(e) => handleKeyDown(pos.bird, e)}
              role="button"
              tabIndex={0}
              aria-label={`${pos.bird.commonName}, heard ${
                pos.bird.yearlyCount
              } times, ${
                pos.bird.hasPhoto ? "photographed" : "not yet photographed"
              }`}
            />
            {/* Show species name for larger bubbles */}
            {pos.r > 40 && (
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs font-medium pointer-events-none"
                style={{ fontSize: "12px", userSelect: "none" }}
              >
                {pos.bird.commonName.length > 15
                  ? pos.bird.commonName.substring(0, 12) + "..."
                  : pos.bird.commonName}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      <BubbleChartTooltip
        bird={hoveredBird}
        position={tooltipPos}
        visible={!!hoveredBird}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[var(--moss-400)]" />
          <span className="text-[var(--forest-700)]">Photographed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[var(--sky-400)]" />
          <span className="text-[var(--forest-700)]">Not Yet Photographed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--mist-600)] text-xs">
            Bubble size = visit frequency
          </span>
        </div>
      </div>
    </div>
  );
}
