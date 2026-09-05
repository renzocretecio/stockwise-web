"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { MovementTypeChart } from "@/modules/reports/components/movement-type-chart";
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
import { useStockMovementReport } from "@/modules/reports/services/reports";
import type {
    ReportPeriod,
    StockMovementReport,
} from "@/modules/reports/types";

type Movement = StockMovementReport["by_type"][number];

const movementLabel = (value: string) => value.replaceAll("_", " ");

const signedNumber = (value: number) =>
    `${value > 0 ? "+" : ""}${number.format(value)}`;

const columns: DataTableColumn<Movement>[] = [
    {
        key: "type",
        header: "Movement type",
        cell: (row) => (
            <span className="font-medium capitalize">
                {movementLabel(row.movement_type)}
            </span>
        ),
    },
    {
        key: "count",
        header: "Movements",
        align: "right",
        cell: (row) => number.format(row.total_movements),
    },
    {
        key: "quantity",
        header: "Net quantity change",
        align: "right",
        cell: (row) => (
            <span
                className={
                    row.total_quantity_change < 0
                        ? "font-medium text-destructive"
                        : "font-medium text-primary"
                }
            >
                {signedNumber(row.total_quantity_change)}
            </span>
        ),
    },
];

export default function MovementReportPage() {
    const [period, setPeriod] = useState<ReportPeriod>(30);
    const { data, isLoading, error, refetch, isFetching } =
        useStockMovementReport(period);

    return (
        <div className="pb-12">
            <ReportHeader
                title="Stock Movement Report"
                description="Inventory inflows, outflows, and adjustments by type."
                icon={ArrowLeftRight}
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
                <MovementContent data={data} />
            )}
        </div>
    );
}

function MovementContent({ data }: { data: StockMovementReport }) {
    const inbound = data.by_type
        .filter((row) => row.total_quantity_change > 0)
        .reduce((total, row) => total + row.total_quantity_change, 0);
    const outbound = data.by_type
        .filter((row) => row.total_quantity_change < 0)
        .reduce((total, row) => total + Math.abs(row.total_quantity_change), 0);
    const netChange = inbound - outbound;
    const summary: ReportSummaryItem[] = [
        {
            label: "Movement records",
            value: number.format(data.total_movements),
        },
        {
            label: "Inbound units",
            value: `+${number.format(inbound)}`,
        },
        {
            label: "Outbound units",
            value: `-${number.format(outbound)}`,
        },
        {
            label: "Net change",
            value: signedNumber(netChange),
        },
    ];

    return (
        <>
            <ReportOverviewCard
                title="Movement balance by type"
                description="Net inventory quantity added or removed by source."
                chart={<MovementTypeChart movements={data.by_type} />}
                summary={summary}
            />
            <section className="p-2 sm:p-4">
                <h2 className="mb-3 px-2 font-semibold">Movement breakdown</h2>
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={data.by_type}
                    getRowId={(row) => row.movement_type}
                    emptyLabel="movement summary"
                />
            </section>
        </>
    );
}
