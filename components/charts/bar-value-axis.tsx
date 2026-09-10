"use client";

import { useMemo } from "react";

import { useChartStable, useYScale } from "./chart-context";
import {
  resolveYAxisTickCount,
  Y_AXIS_DEFAULT_TICK_COUNT,
} from "./y-axis-ticks";

export interface BarValueAxisProps {
  numTicks?: number;
  formatValue?: (value: number) => string;
  showZeroLine?: boolean;
  yAxisId?: string | number;
}

export function BarValueAxis({
  numTicks = Y_AXIS_DEFAULT_TICK_COUNT,
  formatValue = String,
  showZeroLine = true,
  yAxisId,
}: BarValueAxisProps) {
  const { innerHeight, orientation } = useChartStable();
  const valueScale = useYScale(yAxisId);
  const ticks = useMemo(
    () => valueScale.ticks(resolveYAxisTickCount(numTicks)),
    [numTicks, valueScale],
  );

  if (orientation !== "horizontal") {
    return null;
  }

  const zeroX = valueScale(0) ?? 0;

  return (
    <g aria-hidden="true" className="pointer-events-none">
      {showZeroLine ? (
        <line
          stroke="var(--border)"
          strokeWidth={1}
          x1={zeroX}
          x2={zeroX}
          y1={0}
          y2={innerHeight}
        />
      ) : null}
      {ticks.map((value) => (
        <text
          fill="var(--chart-label)"
          fontSize={12}
          key={value}
          textAnchor="middle"
          x={valueScale(value) ?? 0}
          y={innerHeight + 24}
        >
          {formatValue(value)}
        </text>
      ))}
    </g>
  );
}

BarValueAxis.displayName = "BarValueAxis";

export default BarValueAxis;
