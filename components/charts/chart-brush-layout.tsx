"use client";

import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import type { ChartBrushSelection } from "./chart-brush";
import { resolveBrushTrackXExtent } from "./filter-data-by-x-domain";

export interface ChartBrushLayoutState {
  xDomain: [Date, Date] | undefined;
  xDomainSlotCount: number | undefined;
  brushSelection: ChartBrushSelection | null;
  onBrushSelectionChange: (selection: ChartBrushSelection | null) => void;
}

export interface ChartBrushLayoutProps {
  data: Record<string, unknown>[];
  xDataKey?: string;
  xExtentMax?: Date;
  enabled: boolean;
  height: number;
  fitMainContent?: boolean;
  className?: string;
  children: (layout: ChartBrushLayoutState) => ReactNode;
  brushStrip?: (layout: ChartBrushLayoutState) => ReactNode;
}

function createXAccessor(xDataKey: string) {
  return (point: Record<string, unknown>): Date => {
    const value = point[xDataKey];

    return value instanceof Date ? value : new Date(value as string | number);
  };
}

export const ChartBrushLayout = memo(function ChartBrushLayout({
  data,
  xDataKey = "date",
  xExtentMax,
  enabled,
  height,
  fitMainContent = false,
  className,
  children,
  brushStrip,
}: ChartBrushLayoutProps) {
  const xAccessor = useMemo(() => createXAccessor(xDataKey), [xDataKey]);
  const fullExtent = useMemo(
    () => resolveBrushTrackXExtent(data, xAccessor, xExtentMax),
    [data, xAccessor, xExtentMax],
  );
  const [brushSelection, setBrushSelection] =
    useState<ChartBrushSelection | null>(null);

  useEffect(() => {
    if (!fullExtent) {
      setBrushSelection(null);
      return;
    }

    setBrushSelection({
      start: fullExtent[0],
      end: fullExtent[1],
    });
  }, [fullExtent]);

  const handleBrushSelectionChange = useCallback(
    (selection: ChartBrushSelection | null) => {
      if (!selection) {
        if (fullExtent) {
          setBrushSelection({
            start: fullExtent[0],
            end: fullExtent[1],
          });
        }
        return;
      }

      setBrushSelection(selection);
    },
    [fullExtent],
  );

  const layoutState = useMemo<ChartBrushLayoutState>(
    () => ({
      xDomain:
        enabled && brushSelection
          ? [brushSelection.start, brushSelection.end]
          : undefined,
      xDomainSlotCount: enabled ? data.length : undefined,
      brushSelection,
      onBrushSelectionChange: handleBrushSelectionChange,
    }),
    [brushSelection, data.length, enabled, handleBrushSelectionChange],
  );

  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 flex-col",
        fitMainContent ? "justify-start gap-1" : "gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "min-h-0 min-w-0",
          fitMainContent ? "shrink-0" : "flex-1",
        )}
      >
        {children(layoutState)}
      </div>
      {enabled && brushStrip ? (
        <div className="min-h-0 shrink-0" style={{ height }}>
          {brushStrip(layoutState)}
        </div>
      ) : null}
    </div>
  );
});
