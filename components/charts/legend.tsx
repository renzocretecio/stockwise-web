"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { cn } from "@/lib/utils";
import type { RingData } from "./ring-context";

type LegendContextValue = {
  hoveredIndex: number | null;
  items: RingData[];
  onHoverChange: (index: number | null) => void;
};

type LegendItemContextValue = {
  index: number;
  item: RingData;
  isHovered: boolean;
  isMuted: boolean;
};

const LegendContext = createContext<LegendContextValue | null>(null);
const LegendItemContext = createContext<LegendItemContextValue | null>(null);

function useLegend() {
  const context = useContext(LegendContext);
  if (!context) {
    throw new Error("Legend components must be used inside Legend.");
  }
  return context;
}

function useLegendItem() {
  const context = useContext(LegendItemContext);
  if (!context) {
    throw new Error(
      "Legend item components must be used inside LegendItemComponent.",
    );
  }
  return context;
}

export function Legend({
  children,
  className,
  hoveredIndex,
  items,
  onHoverChange,
}: {
  children: ReactNode;
  className?: string;
  hoveredIndex: number | null;
  items: RingData[];
  onHoverChange: (index: number | null) => void;
}) {
  return (
    <LegendContext.Provider
      value={{ hoveredIndex, items, onHoverChange }}
    >
      <div className={cn("space-y-2", className)}>{children}</div>
    </LegendContext.Provider>
  );
}

export function LegendItemComponent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { hoveredIndex, items, onHoverChange } = useLegend();

  return items.map((item, index) => {
    const isHovered = hoveredIndex === index;
    const isMuted = hoveredIndex !== null && !isHovered;

    return (
      <LegendItemContext.Provider
        key={item.label}
        value={{ index, item, isHovered, isMuted }}
      >
        <button
          className={cn(
            "block w-full rounded-2xl p-2 text-left transition-colors",
            "hover:bg-muted/60 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
            isHovered && "bg-muted/60",
            isMuted && "opacity-55",
            className,
          )}
          onBlur={() => onHoverChange(null)}
          onFocus={() => onHoverChange(index)}
          onMouseEnter={() => onHoverChange(index)}
          onMouseLeave={() => onHoverChange(null)}
          type="button"
        >
          <div
            className={
              "grid grid-cols-[auto_minmax(0,1fr)_auto] " +
              "items-center gap-x-2"
            }
          >
            {children}
          </div>
        </button>
      </LegendItemContext.Provider>
    );
  });
}

export function LegendMarker({ className }: { className?: string }) {
  const { item } = useLegendItem();

  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: item.color }}
    />
  );
}

export function LegendLabel({ className }: { className?: string }) {
  const { item } = useLegendItem();

  return (
    <span className={cn("min-w-0 flex-1 text-xs", className)}>
      {item.label}
    </span>
  );
}

export function LegendValue({
  className,
  showPercentage = false,
}: {
  className?: string;
  showPercentage?: boolean;
}) {
  const { item } = useLegendItem();
  const percentage = item.maxValue
    ? Math.round((item.value / item.maxValue) * 100)
    : 0;

  return (
    <span
      className={cn(
        "shrink-0 text-xs font-semibold tabular-nums",
        className,
      )}
    >
      {item.value}
      {showPercentage ? (
        <span className="ml-1 font-normal text-muted-foreground">
          {percentage}%
        </span>
      ) : null}
    </span>
  );
}

export function LegendProgress({ className }: { className?: string }) {
  const { item } = useLegendItem();
  const percentage = item.maxValue
    ? Math.min(100, Math.max(0, (item.value / item.maxValue) * 100))
    : 0;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "col-span-3 mt-1.5 block h-1 overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <span
        className="block h-full rounded-full transition-[width]"
        style={{
          backgroundColor: item.color,
          width: `${percentage}%`,
        }}
      />
    </span>
  );
}
