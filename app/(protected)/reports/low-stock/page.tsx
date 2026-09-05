"use client";

import { AlertTriangle } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import {
    ReportOverviewCard,
    type ReportSummaryItem,
} from "@/modules/reports/components/report-overview-card";
import {
    number,
    ReportError,
    ReportHeader,
    ReportLoading,
} from "@/modules/reports/components/report-ui";
import { StockGapChart } from "@/modules/reports/components/stock-gap-chart";
import { useLowStockReport } from "@/modules/reports/services/reports";
import type { LowStockReport } from "@/modules/reports/types";

type Item = LowStockReport["items"][number];

const columns: DataTableColumn<Item>[] = [
    {
        key: "product",
        header: "Product",
        cell: (row) => (
            <div>
                <p className="font-medium">{row.product_name}</p>
                <p className="text-xs text-muted-foreground">
                    {row.sku || "No SKU"}
                </p>
            </div>
        ),
    },
    {
        key: "status",
        header: "Status",
        cell: (row) => (
            <Badge
                variant={
                    row.status === "out_of_stock" ? "destructive" : "secondary"
                }
            >
                {row.status.replaceAll("_", " ")}
            </Badge>
        ),
    },
    {
        key: "quantity",
        header: "On hand",
        align: "right",
        cell: (row) => number.format(row.quantity),
    },
    {
        key: "reorder",
        header: "Reorder point",
        align: "right",
        cell: (row) => number.format(row.reorder_point),
    },
    {
        key: "supplier",
        header: "Supplier",
        cell: (row) => (
            <div>
                <p>{row.supplier_name || "Not assigned"}</p>
                <p className="text-xs text-muted-foreground">
                    {row.lead_time_days} day lead time
                </p>
            </div>
        ),
    },
];

export default function LowStockReportPage() {
    const { data, isLoading, error, refetch, isFetching } = useLowStockReport();

    return (
        <div className="pb-12">
            <ReportHeader
                title="Low Stock Report"
                description="Products requiring replenishment attention."
                icon={AlertTriangle}
                isRefreshing={isFetching}
                onRefresh={() => void refetch()}
            />

            {isLoading ? (
                <ReportLoading />
            ) : error || !data ? (
                <ReportError error={error} />
            ) : (
                <LowStockContent data={data} />
            )}
        </div>
    );
}

function LowStockContent({ data }: { data: LowStockReport }) {
    const outOfStock = data.items.filter(
        (item) => item.status === "out_of_stock",
    ).length;
    const withoutSupplier = data.items.filter(
        (item) => !item.supplier_id,
    ).length;
    const summary: ReportSummaryItem[] = [
        {
            label: "Needs attention",
            value: number.format(data.total_items),
        },
        {
            label: "Out of stock",
            value: number.format(outOfStock),
        },
        {
            label: "Low stock",
            value: number.format(data.total_items - outOfStock),
        },
        {
            label: "Without supplier",
            value: number.format(withoutSupplier),
            note: "Assign before reordering",
        },
    ];

    return (
        <>
            <ReportOverviewCard
                title="Largest replenishment gaps"
                description="Units needed to reach reorder or safety-stock targets."
                chart={<StockGapChart items={data.items} />}
                summary={summary}
            />
            <section className="p-2 sm:p-4">
                <h2 className="mb-3 px-2 font-semibold">
                    Products requiring action
                </h2>
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={data.items}
                    getRowId={(row) => row.product_id}
                    emptyLabel="low-stock product"
                />
            </section>
        </>
    );
}
