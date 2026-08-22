"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Builds a compact page list with ellipses, e.g.:
 *   1 ... 4 5 [6] 7 8 ... 42
 * Always shows first, last, current, and one neighbor on each side.
 */
function getPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    const next = sorted[i + 1];
    if (next && next - sorted[i] > 1) {
      result.push("ellipsis");
    }
  }
  return result;
}

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  className,
}: PaginationProps) {
  const { page, page_size, total, total_pages, has_next, has_previous } =
    pagination;

  if (total === 0) return null;

  const rangeStart = (page - 1) * page_size + 1;
  const rangeEnd = Math.min(page * page_size, total);
  const pageNumbers = getPageRange(page, total_pages);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-2",
        className
      )}
    >
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{rangeStart}</span>
        {"–"}
        <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-3 order-1 sm:order-2">
        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Rows</span>
            <select
              value={page_size}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => onPageChange(page - 1)}
            disabled={!has_previous || isLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={cn("h-8 w-8 p-0 cursor-pointer", p === page && "pointer-events-none")}
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          {/* Mobile: compact "page X of Y" instead of number buttons */}
          <span className="sm:hidden text-sm text-muted-foreground px-2">
            {page} / {total_pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => onPageChange(page + 1)}
            disabled={!has_next || isLoading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}