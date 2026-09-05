import type { ReactNode } from "react";

export type ReportSummaryItem = {
    label: string;
    value: string;
    note?: string;
};

export function ReportOverviewCard({
    title,
    description,
    chart,
    summary,
}: {
    title: string;
    description: string;
    chart: ReactNode;
    summary: ReportSummaryItem[];
}) {
    return (
        <section className="min-w-0 border-b">
            <div className={"grid min-w-0 lg:grid-cols-[minmax(0,1fr)_240px]"}>
                <div className="min-w-0 p-4 sm:p-5">{chart}</div>
                <dl
                    className={
                        "flex flex-col justify-center divide-y border-t px-4 " +
                        "sm:px-5 lg:border-l lg:border-t-0"
                    }
                >
                    {summary.map((item) => (
                        <SummaryRow item={item} key={item.label} />
                    ))}
                </dl>
            </div>
        </section>
    );
}

function SummaryRow({ item }: { item: ReportSummaryItem }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                {item.note ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.note}
                    </p>
                ) : null}
            </div>
            <dd className="font-semibold tabular-nums">{item.value}</dd>
        </div>
    );
}
