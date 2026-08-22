"use client";

import { useCallback, useEffect, useState } from "react";
import type { SortDirection, SortState } from "@/components/DataTable";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  /** Resets to page 1 whenever these values change (e.g. search, filters) */
  resetDeps?: unknown[];
}

export interface UsePaginationResult {
  page: number;
  pageSize: number;
  search: string;
  sort: SortState | null;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (query: string) => void;
  handleSortChange: (key: string) => void;
}

/**
 * Centralizes page/pageSize/search/sort state for any list page, so every
 * table in the app wires up pagination the same way instead of each page
 * hand-rolling its own useState calls.
 *
 * Usage:
 *   const { page, pageSize, search, setPage, setSearch, sort, handleSortChange } =
 *     usePagination({ resetDeps: [selectedCategory] });
 *
 *   const { data } = useProducts(businessId, page, pageSize, search);
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const { initialPage = 1, initialPageSize = 10, resetDeps = [] } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearchState] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);

  // Reset to page 1 whenever filters/search change — avoids landing on an
  // out-of-range page after the result set shrinks.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pageSize, ...resetDeps]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
  }, []);

  const handleSortChange = useCallback((key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" as SortDirection };
      if (prev.direction === "asc") return { key, direction: "desc" as SortDirection };
      return null; // third click clears sorting
    });
  }, []);

  return {
    page,
    pageSize,
    search,
    sort,
    setPage,
    setPageSize,
    setSearch,
    handleSortChange,
  };
}