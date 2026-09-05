"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { ProductProfitChart } from "@/modules/reports/components/product-profit-chart";
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
import { useProfitReport } from "@/modules/reports/services/reports";
import type { ProfitReport, ReportPeriod } from "@/modules/reports/types";

type Product = ProfitReport["by_product"][number];

const columns: DataTableColumn<Product>[] = [
    {
        key: "product",
        header: "Product",
        cell: (row) => <span className="font-medium">{row.product_name}</span>,
    },
    {
        key: "quantity",
        header: "Qty",
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
        key: "cost",
        header: "Cost",
        align: "right",
        cell: (row) => currency.format(row.cost),
    },
    {
        key: "profit",
        header: "Profit",
        align: "right",
        cell: (row) => (
            <span
                className={
                    row.profit < 0
                        ? "font-medium text-destructive"
                        : "font-medium text-primary"
                }
            >
                {currency.format(row.profit)}
            </span>
        ),
    },
    {
        key: "margin",
        header: "Margin",
        align: "right",
        cell: (row) => `${row.margin_percent.toFixed(1)}%`,
    },
];

export default function ProfitReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30);
    const { data, isLoading, error, refetch, isFetching } =
        useProfitReport(period);

    return (
        <div className="pb-12">
            <ReportHeader
                title="Profit Report"
                description="Gross profit and margin based on captured sale costs."
                icon={DollarSign}
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
                <ProfitReportContent data={data} />
            )}
        </div>
    );
}

function ProfitReportContent({ data }: { data: ProfitReport }) {
    const summary: ReportSummaryItem[] = [
        {
            label: "Revenue",
            value: currency.format(data.summary.total_revenue),
        },
        {
            label: "Cost of goods",
            value: currency.format(data.summary.total_cost),
        },
        {
            label: "Gross profit",
            value: currency.format(data.summary.total_profit),
        },
        {
            label: "Gross margin",
            value: `${data.summary.profit_margin_percent.toFixed(1)}%`,
        },
    ];

    return (
        <>
            <ReportOverviewCard
                title="Product profitability"
                description="Highest gross-profit contributions in this period."
                chart={<ProductProfitChart products={data.by_product} />}
                summary={summary}
            />
            <section className="p-2 sm:p-4">
                <h2 className="mb-3 px-2 font-semibold">Profit by product</h2>
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={data.by_product}
                    getRowId={(row) => row.product_id}
                    emptyLabel="product profit"
                />
            </section>
        </>
    );
}
