"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import {
    currency,
    number,
    ReportError,
    ReportHeader,
    ReportLoading,
} from "@/modules/reports/components/report-ui";
import { PurchaseSpendChart } from "@/modules/reports/components/purchase-spend-chart";
import { SupplierSpendChart } from "@/modules/reports/components/supplier-spend-chart";
import { usePurchaseReport } from "@/modules/reports/services/reports";
import type { PurchaseReport, ReportPeriod } from "@/modules/reports/types";

type Supplier = PurchaseReport["by_supplier"][number];

const columns: DataTableColumn<Supplier>[] = [
    {
        key: "supplier",
        header: "Supplier",
        cell: (row) => <span className="font-medium">{row.supplier_name}</span>,
    },
    {
        key: "purchases",
        header: "Received orders",
        align: "right",
        cell: (row) => number.format(row.purchases_count),
    },
    {
        key: "spent",
        header: "Total spent",
        align: "right",
        cell: (row) => (
            <span className="font-medium">
                {currency.format(row.total_spent)}
            </span>
        ),
    },
];

export default function PurchaseReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30);
    const { data, isLoading, error, refetch, isFetching } =
        usePurchaseReport(period);

    return (
        <div className="pb-12">
            <ReportHeader
                title="Purchasing performance"
                description={
                    "Received purchasing spend " + "and supplier performance."
                }
                icon={TrendingDown}
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
                    <PurchasePerformance data={data} period={period} />

                    <section
                        className={
                            "grid min-w-0 gap-4 p-2 sm:p-4 " +
                            "xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
                        }
                    >
                        <SupplierComparison suppliers={data.by_supplier} />
                        <div className="min-w-0">
                            <h2 className="mb-3 px-2 font-semibold">
                                Supplier details
                            </h2>
                            <DataTable
                                className="rounded-none border-0 shadow-none ring-0"
                                columns={columns}
                                data={data.by_supplier}
                                getRowId={(row) => row.supplier_id}
                                emptyLabel="supplier purchase"
                            />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

function PurchasePerformance({
    data,
    period,
}: {
    data: PurchaseReport;
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
                    <PurchaseSpendChart points={data.by_day} days={period} />
                </div>
                <dl
                    className={
                        "divide-y border-t px-5 lg:border-l " + "lg:border-t-0"
                    }
                >
                    <SummaryRow
                        label="Total spent"
                        value={currency.format(summary.total_spent)}
                    />
                    <SummaryRow
                        label="Received purchases"
                        value={number.format(summary.total_purchases)}
                    />
                    <SummaryRow
                        label="Units received"
                        value={number.format(summary.total_items_received)}
                    />
                    <SummaryRow
                        label="Average purchase"
                        value={currency.format(summary.average_purchase_value)}
                    />
                    <SummaryRow
                        label="Awaiting action"
                        value={number.format(summary.pending_count)}
                        note="Draft and ordered"
                    />
                </dl>
            </div>
        </section>
    );
}

function SupplierComparison({ suppliers }: { suppliers: Supplier[] }) {
    return (
        <section className="min-w-0 border">
            <div className="border-b px-5 py-4">
                <h2 className="font-semibold">Top supplier spend</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    Received purchasing value by supplier.
                </p>
            </div>
            <div className="min-w-0 p-4 sm:p-5">
                <SupplierSpendChart suppliers={suppliers} />
            </div>
        </section>
    );
}

function SummaryRow({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                {note ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {note}
                    </p>
                ) : null}
            </div>
            <dd className="font-semibold tabular-nums">{value}</dd>
        </div>
    );
}
