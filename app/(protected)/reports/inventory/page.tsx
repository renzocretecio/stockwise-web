"use client";

import { Package } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { InventoryCategoryValueChart } from
    "@/modules/reports/components/inventory-category-value-chart";
import {
    ReportOverviewCard,
    type ReportSummaryItem,
} from "@/modules/reports/components/report-overview-card";
import {
    currency,
    number,
    ReportError,
    ReportHeader,
    ReportLoading,
} from "@/modules/reports/components/report-ui";
import { useInventoryReport } from "@/modules/reports/services/reports";
import type { InventoryReport } from "@/modules/reports/types";

type Category = InventoryReport["by_category"][number];

const columns: DataTableColumn<Category>[] = [
    {
        key: "category",
        header: "Category",
        cell: (row) => <span className="font-medium">{row.category}</span>,
    },
    {
        key: "products",
        header: "Products",
        align: "right",
        cell: (row) => number.format(row.product_count),
    },
    {
        key: "units",
        header: "Units",
        align: "right",
        cell: (row) => number.format(row.total_units),
    },
    {
        key: "value",
        header: "Stock value",
        align: "right",
        cell: (row) => (
            <span className="font-medium">
                {currency.format(row.stock_value)}
            </span>
        ),
    },
];

export default function InventoryReportPage() {
    const { data, isLoading, error, refetch, isFetching } =
        useInventoryReport();

    return (
        <div className="pb-12">
            <ReportHeader
                title="Inventory value distribution"
                description="Current stock valuation and category distribution."
                icon={Package}
                isRefreshing={isFetching}
                onRefresh={() => void refetch()}
            />

            {isLoading ? (
                <ReportLoading />
            ) : error || !data ? (
                <ReportError error={error} />
            ) : (
                <InventoryReportContent data={data} />
            )}
        </div>
    );
}

function InventoryReportContent({ data }: { data: InventoryReport }) {
    const summary: ReportSummaryItem[] = [
        {
            label: "Stock value",
            value: currency.format(data.summary.total_stock_value),
        },
        {
            label: "Active products",
            value: number.format(data.summary.total_products),
        },
        {
            label: "Total units",
            value: number.format(data.summary.total_units),
        },
        {
            label: "Low stock",
            value: number.format(data.summary.low_stock_count),
        },
        {
            label: "Out of stock",
            value: number.format(data.summary.out_of_stock_count),
        },
    ];

    return (
        <>
            <ReportOverviewCard
                title="Inventory value distribution"
                description="Stock value by category at average cost."
                chart={
                    <InventoryCategoryValueChart
                        categories={data.by_category}
                    />
                }
                summary={summary}
            />
            <section className="p-2 sm:p-4">
                <h2 className="mb-3 px-2 font-semibold">Category breakdown</h2>
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={data.by_category}
                    getRowId={(row) => row.category}
                    emptyLabel="category"
                />
            </section>
        </>
    );
}
