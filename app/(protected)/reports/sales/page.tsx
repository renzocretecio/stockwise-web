"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SalesProfitChart } from "@/modules/dashboard/components/sales-profit-chart";
import {
    currency,
    number,
    ReportError,
    ReportHeader,
    ReportLoading,
} from "@/modules/reports/components/report-ui";
import { useSalesReport } from "@/modules/reports/services/reports";
import type { ReportPeriod, SalesReport } from "@/modules/reports/types";

type Product = SalesReport["top_products"][number];

const columns: DataTableColumn<Product>[] = [
    {
        key: "product",
        header: "Product",
        cell: (row) => <span className="font-medium">{row.product_name}</span>,
    },
    {
        key: "quantity",
        header: "Qty sold",
        align: "right",
        cell: (row) => number.format(row.quantity_sold),
    },
    {
        key: "revenue",
        header: "Revenue",
        align: "right",
        cell: (row) => currency.format(row.revenue),
    },
    {
        key: "profit",
        header: "Profit",
        align: "right",
        cell: (row) => (
            <span className="font-medium text-emerald-600">
                {currency.format(row.profit)}
            </span>
        ),
    },
];

export default function SalesReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30);
    const { data, isLoading, error, refetch, isFetching } =
        useSalesReport(period);

    return (
        <div className="pb-12">
            <ReportHeader
                title="Sales performance"
                description={
                    "Revenue, profit, sales volume, " +
                    "and best-selling products."
                }
                icon={TrendingUp}
                period={period}
                onPeriodChange={setPeriod}
                isRefreshing={isFetching}
                onRefresh={() => void refetch()}
            />

            {isLoading ? (
                <ReportLoading />
            ) : error || !data ? (
                <ReportError error={error} />
            ) : (
                <>
                    <SalesPerformance data={data} period={period} />

                    <section className="p-2 sm:p-4">
                        <h2 className="mb-3 px-2 font-semibold">
                            Top products
                        </h2>
                        <DataTable
                            className="rounded-none border-0 shadow-none ring-0"
                            columns={columns}
                            data={data.top_products}
                            getRowId={(row) => row.product_id}
                            emptyLabel="product sale"
                        />
                    </section>
                </>
            )}
        </div>
    );
}

function SalesPerformance({
    data,
    period,
}: {
    data: SalesReport;
    period: ReportPeriod;
}) {
    const summary = data.summary;

    return (
        <section className="min-w-0 border-b">
            <div
                className={
                    "grid min-w-0 " + "lg:grid-cols-[minmax(0,1fr)_240px]"
                }
            >
                <div className="min-w-0 p-4 sm:p-5">
                    <SalesProfitChart points={data.by_day} days={period} />
                </div>
                <dl
                    className={
                        "divide-y border-t px-5 lg:border-l " + "lg:border-t-0"
                    }
                >
                    <SummaryRow
                        label="Net sales"
                        value={currency.format(summary.total_revenue)}
                    />
                    <SummaryRow
                        label="Gross profit"
                        value={currency.format(summary.total_profit)}
                    />
                    <SummaryRow
                        label="Completed sales"
                        value={number.format(summary.total_sales)}
                    />
                    <SummaryRow
                        label="Units sold"
                        value={number.format(summary.total_items_sold)}
                    />
                    <SummaryRow
                        label="Average sale"
                        value={currency.format(summary.average_sale_value)}
                    />
                    <SummaryRow
                        label="Voided sales"
                        value={number.format(summary.voided_count)}
                    />
                </dl>
            </div>
        </section>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
        </div>
    );
}
