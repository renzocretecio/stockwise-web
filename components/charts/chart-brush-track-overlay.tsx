"use client";

export interface ChartBrushTrackOverlayStyle {
  blurPx?: number;
  fadeOuterEdges?: boolean;
}

export interface ChartBrushTrackOverlayProps
  extends ChartBrushTrackOverlayStyle {
  innerWidth: number;
  innerHeight: number;
  selectionX0: number;
  selectionX1: number;
}

export function ChartBrushTrackOverlay({
  innerWidth,
  innerHeight,
  selectionX0,
  selectionX1,
}: ChartBrushTrackOverlayProps) {
  const x0 = Math.max(0, Math.min(selectionX0, selectionX1, innerWidth));
  const x1 = Math.max(
    x0,
    Math.min(Math.max(selectionX0, selectionX1), innerWidth),
  );
  const leftWidth = Math.max(0, x0);
  const rightWidth = Math.max(0, innerWidth - x1);
  const dimColor = "color-mix(in srgb, var(--background) 72%, transparent)";

  if (leftWidth <= 0 && rightWidth <= 0) {
    return null;
  }

  return (
    <g aria-hidden="true" className="pointer-events-none">
      {leftWidth > 0 ? (
        <rect fill={dimColor} height={innerHeight} width={leftWidth} />
      ) : null}
      {rightWidth > 0 ? (
        <rect fill={dimColor} height={innerHeight} width={rightWidth} x={x1} />
      ) : null}
    </g>
  );
}
