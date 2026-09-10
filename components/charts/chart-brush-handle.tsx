"use client";

import type { BrushHandleRenderProps } from "@visx/brush/lib/BrushHandle";

const HANDLE_HEIGHT_PX = 24;
const HANDLE_WIDTH_PX = 4;

function brushHandleCursor(className: string) {
  return className.includes("left") || className.includes("right")
    ? "ew-resize"
    : "ns-resize";
}

export function renderChartBrushHandle({
  x,
  y,
  width,
  height,
  className,
}: BrushHandleRenderProps) {
  return (
    <rect
      className={className}
      fill="transparent"
      height={height}
      style={{ cursor: brushHandleCursor(className) }}
      width={width}
      x={x}
      y={y}
    />
  );
}

export interface ChartBrushHandleOverlayProps {
  innerWidth: number;
  innerHeight: number;
  selectionX0: number;
  selectionX1: number;
}

export function ChartBrushHandleOverlay({
  innerWidth,
  innerHeight,
  selectionX0,
  selectionX1,
}: ChartBrushHandleOverlayProps) {
  const x0 = Math.max(0, Math.min(selectionX0, selectionX1, innerWidth));
  const x1 = Math.max(
    x0,
    Math.min(Math.max(selectionX0, selectionX1), innerWidth),
  );
  const edges = x0 === x1 ? [x0] : [x0, x1];
  const handleTop = (innerHeight - HANDLE_HEIGHT_PX) / 2;

  return (
    <g aria-hidden="true" className="pointer-events-none">
      {edges.map((edgeX) => (
        <rect
          fill="var(--primary)"
          height={HANDLE_HEIGHT_PX}
          key={edgeX}
          rx={HANDLE_WIDTH_PX / 2}
          width={HANDLE_WIDTH_PX}
          x={edgeX - HANDLE_WIDTH_PX / 2}
          y={handleTop}
        />
      ))}
    </g>
  );
}
