"use client";

import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  ChartBrushHandleOverlay,
  renderChartBrushHandle,
} from "./chart-brush-handle";
import {
  ChartBrushTrackOverlay,
  type ChartBrushTrackOverlayStyle,
} from "./chart-brush-track-overlay";
import { useChartStable } from "./chart-context";

interface VisxBrushProps {
  xScale: unknown;
  yScale: unknown;
  width: number;
  height: number;
  onBrushEnd?: (bounds: Bounds | null) => void;
  onChange?: (bounds: Bounds | null) => void;
  brushDirection?: "horizontal" | "vertical" | "both";
  margin?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  selectedBoxStyle?: React.SVGProps<SVGRectElement>;
  handleSize?: number;
  renderBrushHandle?: (props: {
    x: number;
    y: number;
    width: number;
    height: number;
    className: string;
    isBrushActive: boolean;
  }) => React.ReactNode;
  useWindowMoveEvents?: boolean;
  initialBrushPosition?: {
    start?: { x?: number; y?: number };
    end?: { x?: number; y?: number };
  };
}

const BrushComponent = Brush as unknown as React.ComponentType<VisxBrushProps>;

export interface ChartBrushSelection {
  start: Date;
  end: Date;
}

export interface ChartBrushProps extends ChartBrushTrackOverlayStyle {
  onSelectionChange?: (domain: ChartBrushSelection | null) => void;
  brushDirection?: "horizontal" | "vertical" | "both";
  selectedBoxStyle?: React.SVGProps<SVGRectElement>;
  initialSelection?: ChartBrushSelection | null;
  useWindowMoveEvents?: boolean;
}

type ChartScale = ReturnType<typeof useChartStable>["xScale"];

function toDate(value: number | Date | unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value);
  }

  return new Date(Number(value));
}

function boundsToPixelExtent(
  bounds: Bounds | null,
  xScale: ChartScale,
  innerWidth: number,
): { x0: number; x1: number } | null {
  if (
    !bounds ||
    typeof bounds.x0 === "undefined" ||
    typeof bounds.x1 === "undefined"
  ) {
    return null;
  }

  const start = toDate(bounds.x0);
  const end = toDate(bounds.x1);
  const x0 = Math.max(0, xScale(start < end ? start : end) ?? 0);
  const x1 = Math.min(
    innerWidth,
    xScale(end > start ? end : start) ?? innerWidth,
  );

  return x1 > x0 ? { x0, x1 } : null;
}

interface ChartBrushInnerProps extends ChartBrushTrackOverlayStyle {
  brushDirection?: ChartBrushProps["brushDirection"];
  selectedBoxStyle?: ChartBrushProps["selectedBoxStyle"];
  initialSelection?: ChartBrushProps["initialSelection"];
  useWindowMoveEvents?: boolean;
  xScale: ChartScale;
  yScale: ReturnType<typeof useChartStable>["yScale"];
  innerWidth: number;
  innerHeight: number;
  margin: ReturnType<typeof useChartStable>["margin"];
  onBrushPreview: (bounds: Bounds | null) => void;
  onBrushCommit: (bounds: Bounds | null) => void;
}

const ChartBrushInner = memo(function ChartBrushInner({
  brushDirection = "horizontal",
  selectedBoxStyle,
  initialSelection,
  useWindowMoveEvents = true,
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  margin,
  onBrushPreview,
  onBrushCommit,
  blurPx,
  fadeOuterEdges,
}: ChartBrushInnerProps) {
  const initialBrushPosition = useMemo(() => {
    if (!initialSelection || innerWidth <= 0 || innerHeight <= 0) {
      return undefined;
    }

    const x0 = Math.max(0, xScale(initialSelection.start) ?? 0);
    const x1 = Math.min(innerWidth, xScale(initialSelection.end) ?? innerWidth);

    if (x1 <= x0) {
      return undefined;
    }

    return {
      start: { x: x0, y: 0 },
      end: { x: x1, y: innerHeight },
    };
  }, [initialSelection, xScale, innerWidth, innerHeight]);

  const [pixelExtent, setPixelExtent] = useState(() => ({
    x0: initialBrushPosition?.start.x ?? 0,
    x1: initialBrushPosition?.end.x ?? innerWidth,
  }));

  useEffect(() => {
    // Keep the visual selection aligned when the chart is resized or reset.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPixelExtent({
      x0: initialBrushPosition?.start.x ?? 0,
      x1: initialBrushPosition?.end.x ?? innerWidth,
    });
  }, [initialBrushPosition, innerWidth]);

  const updatePixelExtent = useCallback(
    (bounds: Bounds | null) => {
      const pixels = boundsToPixelExtent(bounds, xScale, innerWidth);
      if (pixels) {
        setPixelExtent(pixels);
      }
    },
    [innerWidth, xScale],
  );

  const handleBrushPreview = useCallback(
    (bounds: Bounds | null) => {
      updatePixelExtent(bounds);
      onBrushPreview(bounds);
    },
    [onBrushPreview, updatePixelExtent],
  );
  const handleBrushCommit = useCallback(
    (bounds: Bounds | null) => {
      updatePixelExtent(bounds);
      onBrushCommit(bounds);
    },
    [onBrushCommit, updatePixelExtent],
  );

  return (
    <g className="chart-brush">
      <ChartBrushTrackOverlay
        blurPx={blurPx}
        fadeOuterEdges={fadeOuterEdges}
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        selectionX0={pixelExtent.x0}
        selectionX1={pixelExtent.x1}
      />
      <ChartBrushHandleOverlay
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        selectionX0={pixelExtent.x0}
        selectionX1={pixelExtent.x1}
      />
      <BrushComponent
        brushDirection={brushDirection}
        handleSize={8}
        height={innerHeight}
        initialBrushPosition={initialBrushPosition}
        key={`brush-${innerWidth}-${innerHeight}`}
        margin={
          useWindowMoveEvents
            ? margin
            : { top: 0, left: 0, right: 0, bottom: 0 }
        }
        onBrushEnd={handleBrushCommit}
        onChange={handleBrushPreview}
        renderBrushHandle={renderChartBrushHandle}
        selectedBoxStyle={
          selectedBoxStyle ?? {
            fill: "color-mix(in srgb, var(--primary) 8%, transparent)",
            stroke: "var(--primary)",
            strokeWidth: 1,
          }
        }
        useWindowMoveEvents={useWindowMoveEvents}
        width={innerWidth}
        xScale={xScale}
        yScale={yScale}
      />
    </g>
  );
});

export function ChartBrush({
  onSelectionChange,
  brushDirection = "horizontal",
  selectedBoxStyle,
  initialSelection,
  useWindowMoveEvents = true,
  blurPx,
  fadeOuterEdges,
}: ChartBrushProps) {
  const { xScale, yScale, innerWidth, innerHeight, margin, isLoaded } =
    useChartStable();

  const boundsToSelection = useCallback(
    (bounds: Bounds | null): ChartBrushSelection | null => {
      if (
        !bounds ||
        typeof bounds.x0 === "undefined" ||
        typeof bounds.x1 === "undefined"
      ) {
        return null;
      }

      const start = toDate(bounds.x0);
      const end = toDate(bounds.x1);
      if (start.getTime() === end.getTime()) {
        return null;
      }

      return {
        start: start < end ? start : end,
        end: end > start ? end : start,
      };
    },
    [],
  );
  const notifySelectionChange = useCallback(
    (bounds: Bounds | null) => {
      onSelectionChange?.(boundsToSelection(bounds));
    },
    [boundsToSelection, onSelectionChange],
  );

  if (!isLoaded || innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  return (
    <ChartBrushInner
      blurPx={blurPx}
      brushDirection={brushDirection}
      fadeOuterEdges={fadeOuterEdges}
      initialSelection={initialSelection}
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      margin={margin}
      onBrushCommit={notifySelectionChange}
      onBrushPreview={notifySelectionChange}
      selectedBoxStyle={selectedBoxStyle}
      useWindowMoveEvents={useWindowMoveEvents}
      xScale={xScale}
      yScale={yScale}
    />
  );
}

ChartBrush.displayName = "ChartBrush";
