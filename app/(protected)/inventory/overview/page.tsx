"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Package, RefreshCw, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/currency";
import { getInventoryOverviewColumns } from "@/modules/inventory/columns/overview";
import { InventoryOverviewItem } from "@/modules/inventory/types/overview";
import { useStockOverview } from "@/modules/inventory/services/overview";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { page, pageSize, setPage, setPageSize } = usePagination();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useStockOverview(page, pageSize, debouncedSearchQuery, status);

  const items: InventoryOverviewItem[] = data?.items ?? [];
  const summary = data?.summary;

  const columns = useMemo(() => getInventoryOverviewColumns(), []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory Overview
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Monitor your stock levels, inventory value, and products that need
            attention.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>

              <p className="mt-2 text-2xl font-semibold">
                {summary?.total_products ?? 0}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Value</p>

              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(summary?.total_stock_value ?? 0)}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Boxes className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>

              <p className="mt-2 text-2xl font-semibold text-amber-600">
                {summary?.low_stock_count ?? 0}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <AlertTriangle className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>

              <p className="mt-2 text-2xl font-semibold text-destructive">
                {summary?.out_of_stock_count ?? 0}
              </p>
            </div>

            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Package className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search product or SKU..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={status === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatus("all");
                setPage(1);
              }}
            >
              All
            </Button>

            <Button
              variant={status === "in_stock" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatus("in_stock");
                setPage(1);
              }}
            >
              In Stock
            </Button>

            <Button
              variant={status === "low_stock" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatus("low_stock");
                setPage(1);
              }}
            >
              Low Stock
            </Button>

            <Button
              variant={status === "out_of_stock" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatus("out_of_stock");
                setPage(1);
              }}
            >
              Out of Stock
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-3 text-sm text-destructive">
            <AlertTriangle className="size-5 shrink-0" />

            <div>
              <p className="font-medium">Failed to load inventory</p>

              <p className="text-destructive/80">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while loading inventory."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <DataTable<InventoryOverviewItem>
        columns={columns}
        data={items}
        getRowId={(i) => i.product_id}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          pagination={data.pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="mt-4"
        />
      )}
    </div>
  );
}
