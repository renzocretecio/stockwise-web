"use client";

import { useMemo } from "react";

import { useChartStable, useYScale } from "./chart-context";
import {
  resolveYAxisTickCount,
  Y_AXIS_DEFAULT_TICK_COUNT,
} from "./y-axis-ticks";

export interface YAxisProps {
  yAxisId?: string | number;
  orientation?: "left" | "right";
  numTicks?: number;
  formatLargeNumbers?: boolean;
  formatValue?: (value: number) => string;
}

function formatLabel(
  value: number,
  formatLargeNumbers: boolean,
  formatValue?: (value: number) => string,
) {
  if (formatValue) {
    return formatValue(value);
  }
  if (formatLargeNumbers && Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }

  return String(value);
}

export function YAxis({
  yAxisId,
  orientation = "left",
  numTicks = Y_AXIS_DEFAULT_TICK_COUNT,
  formatLargeNumbers = true,
  formatValue,
}: YAxisProps) {
  const { innerWidth } = useChartStable();
  const yScale = useYScale(yAxisId);
  const isLeft = orientation === "left";
  const ticks = useMemo(
    () => yScale.ticks(resolveYAxisTickCount(numTicks)),
    [numTicks, yScale],
  );

  return (
    <g aria-hidden="true" className="pointer-events-none">
      {ticks.map((value) => (
        <text
          dominantBaseline="middle"
          fill="var(--chart-label)"
          fontSize={12}
          key={value}
          textAnchor={isLeft ? "end" : "start"}
          x={isLeft ? -8 : innerWidth + 8}
          y={yScale(value) ?? 0}
        >
          {formatLabel(value, formatLargeNumbers, formatValue)}
        </text>
      ))}
    </g>
  );
}

YAxis.displayName = "YAxis";
