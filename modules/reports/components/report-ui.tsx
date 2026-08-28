"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReportPeriod } from "@/modules/reports/types";

export const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
export const number = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 3 });

export function ReportHeader({ title, description, icon: Icon, period, onPeriodChange }: { title: string; description: string; icon: LucideIcon; period?: ReportPeriod; onPeriodChange?: (period: ReportPeriod) => void }) {
    return <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
            <div><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
        </div>
        {period && onPeriodChange && <select aria-label="Report period" value={period} onChange={(event) => onPeriodChange(Number(event.target.value) as ReportPeriod)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last year</option>
        </select>}
    </div>;
}

export function MetricGrid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>; }
export function MetricCard({ label, value, note, tone = "default" }: { label: string; value: string; note?: string; tone?: "default" | "good" | "warning" | "danger" }) {
    return <Card className={cn("p-5", tone === "warning" && "border-amber-500/30", tone === "danger" && "border-destructive/30")}><p className="text-sm text-muted-foreground">{label}</p><p className={cn("mt-2 text-2xl font-semibold", tone === "good" && "text-emerald-600", tone === "warning" && "text-amber-600", tone === "danger" && "text-destructive")}>{value}</p>{note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}</Card>;
}

export function ReportError({ error }: { error: unknown }) { return <Card className="border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">{error instanceof Error ? error.message : "Failed to load report."}</Card>; }
export function ReportLoading() { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Card key={index} className="h-28 animate-pulse bg-muted/40" />)}</div>; }

export function BarList<T>({ title, items, getKey, getLabel, getValue, formatValue }: { title: string; items: T[]; getKey: (item: T) => string; getLabel: (item: T) => string; getValue: (item: T) => number; formatValue: (value: number) => string }) {
    const max = Math.max(...items.map(getValue).map(Math.abs), 1);
    return <Card className="p-5"><h2 className="mb-5 font-semibold">{title}</h2>{items.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No data for this period.</p> : <div className="space-y-4">{items.map((item) => { const value = getValue(item); return <div key={getKey(item)}><div className="mb-1.5 flex justify-between gap-4 text-sm"><span className="truncate">{getLabel(item)}</span><span className="shrink-0 font-medium">{formatValue(value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", value < 0 ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.max(Math.abs(value) / max * 100, 2)}%` }} /></div></div>; })}</div>}</Card>;
}
