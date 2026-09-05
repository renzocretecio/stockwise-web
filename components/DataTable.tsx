"use client";

import { type ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Reusable Data Table
 * ---------------------------------------------------------------------------
 * Generic table for any row type `T`. Column config drives both the header
 * and the cell rendering, so this works for Products, Purchases, Sales,
 * Suppliers, etc. without rewriting table markup each time.
 *
 * Pair with <Pagination /> for the footer controls — this component only
 * renders rows; it doesn't know about paging.
 */

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** Enables the sort icon + click-to-sort header for this column */
  sortable?: boolean;
  /** Fixed width hint, e.g. "w-32" */
  width?: string;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** Number of skeleton rows to show while loading */
  skeletonRows?: number;
  emptyState?: ReactNode;
  emptyLabel?: string;
  onRowClick?: (row: T) => void;
  /** Highlight a row, e.g. the currently selected one */
  selectedRowId?: string | null;
  sort?: SortState | null;
  onSortChange?: (key: string) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  skeletonRows = 8,
  emptyState,
  emptyLabel = "record",
  onRowClick,
  selectedRowId,
  sort,
  onSortChange,
  className,
}: DataTableProps<T>) {
  return (
    <Card className={cn("overflow-hidden border-border/80 py-0", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.width,
                    col.className
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {col.header}
                      <SortIcon active={sort?.key === col.key} direction={sort?.direction} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 rounded bg-muted/60 animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState ?? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        No {emptyLabel}s found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        There&apos;s nothing to show here yet.
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = getRowId(row);
                const isSelected = id === selectedRowId;

                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/30"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3.5",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active?: boolean;
  direction?: SortDirection;
}) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-primary" />
  ) : (
    <ArrowDown className="h-3 w-3 text-primary" />
  );
}