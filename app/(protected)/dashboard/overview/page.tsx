"use client";

import {
    Suspense,
    useEffect,
    useRef,
    useState,
    type TouchEvent,
} from "react";
import { Tabs } from "@base-ui/react/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DateRangePicker, type DateRange } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DailyBriefing } from "@/modules/briefings/components/daily-briefing";
import {
    briefingKeys,
    useTodayBriefing,
} from "@/modules/briefings/services/briefings";
import { FeatureGate } from "@/modules/billing/components/feature-gate";
import { AnomalyList } from "@/modules/dashboard/components/anomaly-list";
import { BusinessActivity } from "@/modules/dashboard/components/business-activity";
import { DashboardAnalytics } from "@/modules/dashboard/components/dashboard-analytics";
import { DashboardExportButton } from "@/modules/dashboard/components/dashboard-export-button";
import { DashboardSalesSummary } from "@/modules/dashboard/components/dashboard-sales-summary";
import { DemandForecastCard } from "@/modules/dashboard/components/demand-forecast-card";
import { DemandPatterns } from "@/modules/dashboard/components/demand-patterns";
import { InventoryRiskPanel } from "@/modules/dashboard/components/inventory-risk-panel";
import { ReorderAssistant } from "@/modules/dashboard/components/reorder-assistant";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import { useSalesReportByDateRange } from "@/modules/reports/services/reports";
import type { ReportDateRange } from "@/modules/reports/types";

type DashboardTab =
    | "overview"
    | "insight"
    | "demand-forecast"
    | "inventory-anomalies";

const tile =
    "min-w-0 overflow-hidden rounded-2xl border " +
    "border-border/70 bg-card shadow-sm";
const intelligenceGrid =
    "grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-stretch"
const dashboardTabs = [
    { label: "Overview", value: "overview" },
    { label: "Insight", value: "insight" },
    { label: "Demand forecast", value: "demand-forecast" },
    {
        label: "Inventory anomalies",
        value: "inventory-anomalies",
    },
] as const satisfies ReadonlyArray<{
    label: string;
    value: DashboardTab;
}>;

const toDateValue = (date: Date) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

const initialSalesRange = (): ReportDateRange => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);

    return {
        startDate: toDateValue(start),
        endDate: toDateValue(end),
    };
};

export default function DashboardOverviewPage() {
    return (
        <Suspense fallback={<DashboardPageLoading />}>
            <DashboardOverviewContent />
        </Suspense>
    );
}

function DashboardOverviewContent() {
    const [salesRange, setSalesRange] = useState(initialSalesRange);
    const swipeStart = useRef<{ x: number; y: number } | null>(null);
    const tabListRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = toDashboardTab(searchParams.get("tab"));
    const sales = useSalesReportByDateRange(salesRange);
    const dashboard = useDashboard();
    const briefing = useTodayBriefing();
    const inventory = dashboard.data?.kpis.inventory_value;
    const inventoryDescription =
        inventory !== undefined
            ? "Current stock value"
            : dashboard.isPaused
              ? "Current value not saved offline"
              : dashboard.error
                ? "Unable to load current value"
                : "Loading current value…";
    const salesProps = {
        report: sales.data,
        isLoading: sales.isLoading,
        isPaused: sales.isPaused,
        isError: Boolean(sales.error),
    };

    useEffect(() => {
        const tab = tabListRef.current?.querySelector<HTMLElement>(
            `[data-dashboard-tab="${activeTab}"]`,
        );

        if (!tab || !tabListRef.current) return;

        tabListRef.current.scrollTo({
            behavior: "smooth",
            left:
                tab.offsetLeft -
                (tabListRef.current.clientWidth - tab.offsetWidth) / 2,
        });
    }, [activeTab]);

    const changeSalesRange = (range: DateRange) => {
        if (!range.from || !range.to) return;

        setSalesRange({
            startDate: toDateValue(range.from),
            endDate: toDateValue(range.to),
        });
    };

    const changeTab = (value: unknown) => {
        const nextTab = toDashboardTab(
            typeof value === "string" ? value : null,
        );
        const href =
            nextTab === "overview" ? pathname : `${pathname}?tab=${nextTab}`;

        router.replace(href, { scroll: false });
    };

    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        queryClient.invalidateQueries({ queryKey: briefingKeys.all });
    };

    const startTabSwipe = (event: TouchEvent<HTMLDivElement>) => {
        if (
            event.touches.length !== 1 ||
            shouldIgnoreTabSwipe(event.target)
        ) {
            swipeStart.current = null;
            return;
        }

        swipeStart.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
        };
    };

    const finishTabSwipe = (event: TouchEvent<HTMLDivElement>) => {
        const start = swipeStart.current;
        swipeStart.current = null;

        if (!start || event.changedTouches.length !== 1) return;

        const distanceX = event.changedTouches[0].clientX - start.x;
        const distanceY = event.changedTouches[0].clientY - start.y;

        if (
            Math.abs(distanceX) < 72 ||
            Math.abs(distanceX) < Math.abs(distanceY) * 1.5
        ) {
            return;
        }

        const currentIndex = dashboardTabs.findIndex(
            (tab) => tab.value === activeTab,
        );
        const nextIndex = currentIndex + (distanceX < 0 ? 1 : -1);
        const nextTab = dashboardTabs[nextIndex];

        if (nextTab) changeTab(nextTab.value);
    };

    return (
        <Tabs.Root
            className="pb-12"
            onValueChange={changeTab}
            value={activeTab}
        >
            <div
                className={
                    "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] " +
                    "gap-4 px-1 py-2 " +
                    "xl:grid-cols-[minmax(13rem,1fr)_auto_minmax(21rem,1fr)] " +
                    "xl:items-end"
                }
            >
                <div className="order-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Business overview
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Monitor performance, risks, and inventory decisions.
                    </p>
                </div>

                <Tabs.List
                    activateOnFocus
                    aria-label="Dashboard sections"
                    className={
                        "order-3 col-span-2 flex max-w-full items-center " +
                        "gap-1 overflow-x-auto rounded-2xl border " +
                        "border-border/70 bg-muted/40 p-1 " +
                        "xl:order-2 xl:col-span-1"
                    }
                    ref={tabListRef}
                >
                    {dashboardTabs.map((tab) => (
                        <Tabs.Tab
                            className={(state) =>
                                cn(
                                    "min-h-10 shrink-0 rounded-2xl px-3",
                                    "text-sm font-medium transition-colors",
                                    "text-muted-foreground",
                                    "hover:bg-card/70 hover:text-foreground",
                                    "focus-visible:outline-none",
                                    "focus-visible:ring-2",
                                    "focus-visible:ring-ring",
                                    state.active &&
                                        "bg-card text-foreground shadow-sm",
                                )
                            }
                            data-dashboard-tab={tab.value}
                            key={tab.value}
                            value={tab.value}
                        >
                            {tab.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                <div
                    className={
                        "order-2 flex min-w-0 flex-wrap items-center " +
                        "justify-end gap-2 xl:order-3"
                    }
                    data-no-print="true"
                >
                    <DashboardExportButton
                        dashboard={dashboard.data}
                        dateRange={salesRange}
                        sales={sales.data}
                    />
                    <DateRangePicker
                        className="max-w-full"
                        compactOnMobile
                        maxDays={365}
                        onChange={changeSalesRange}
                        value={{
                            from: new Date(`${salesRange.startDate}T12:00:00`),
                            to: new Date(`${salesRange.endDate}T12:00:00`),
                        }}
                    />
                    <Button
                        aria-label="Refresh dashboard"
                        onClick={refreshDashboard}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            </div>

            <div
                onTouchCancel={() => {
                    swipeStart.current = null;
                }}
                onTouchEnd={finishTabSwipe}
                onTouchStart={startTabSwipe}
            >
                <Tabs.Panel className="mt-4 outline-none" value="overview">
                    <OverviewPanel
                        briefing={briefing}
                        inventory={inventory}
                        inventoryDescription={inventoryDescription}
                        salesProps={salesProps}
                        salesRange={salesRange}
                    />
                </Tabs.Panel>

                <Tabs.Panel className="mt-4 outline-none" value="insight">
                    <InsightPanel />
                </Tabs.Panel>

                <Tabs.Panel
                    className="mt-4 outline-none"
                    value="demand-forecast"
                >
                    <DemandForecastPanel dashboard={dashboard} />
                </Tabs.Panel>

                <Tabs.Panel
                    className="mt-4 outline-none"
                    value="inventory-anomalies"
                >
                    <InventoryAnomaliesPanel dashboard={dashboard} />
                </Tabs.Panel>
            </div>
        </Tabs.Root>
    );
}

function OverviewPanel({
    briefing,
    inventory,
    inventoryDescription,
    salesProps,
    salesRange,
}: {
    briefing: ReturnType<typeof useTodayBriefing>;
    inventory?: number;
    inventoryDescription: string;
    salesProps: {
        report: ReturnType<typeof useSalesReportByDateRange>["data"];
        isLoading: boolean;
        isPaused: boolean;
        isError: boolean;
    };
    salesRange: ReportDateRange;
}) {
    return (
        <div className="space-y-4">
            <DashboardSalesSummary
                {...salesProps}
                briefing={briefing.data?.briefing}
                briefingLoading={briefing.isLoading}
                inventory={inventory}
                inventoryDescription={inventoryDescription}
            />

            <div
                className={
                    "grid min-w-0 items-start gap-4 " +
                    "lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-stretch"
                }
            >
                <div className={tile}>
                    <DashboardAnalytics
                        dateRange={salesRange}
                        {...salesProps}
                    />
                </div>
                <div className={tile}>
                    <InventoryRiskPanel compact />
                </div>
            </div>

            <div
                className={
                    "grid min-w-0 items-start gap-4 " +
                    "lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-stretch"
                }
            >
                <div className={tile}>
                    <BusinessActivity />
                </div>
                <div className={tile}>
                    <DemandPatterns />
                </div>
            </div>
        </div>
    );
}

function InsightPanel() {
    return (
        <div className="space-y-4">
            <DailyBriefing />
        </div>
    );
}

function DemandForecastPanel({
    dashboard,
}: {
    dashboard: ReturnType<typeof useDashboard>;
}) {
    return (
        <div>
            {!dashboard.data ? (
                <DashboardDataState
                    error={dashboard.error}
                    isLoading={dashboard.isLoading}
                    isPaused={dashboard.isPaused}
                    label="demand forecast"
                />
            ) : (
                <FeatureGate
                    className={tile}
                    description={
                        "See demand forecasts and recommended purchase " +
                        "quantities with the Pro plan."
                    }
                    feature="forecasting"
                    title="Demand forecasting is available on Pro"
                >
                    <div className={intelligenceGrid}>
                        <section
                            className={tile}
                            id="demand-forecasting"
                        >
                            <header
                                className={
                                    "flex items-start gap-3 border-b " +
                                    "bg-primary/5 p-5 sm:p-6"
                                }
                            >
                                <span
                                    className={
                                        "grid size-10 shrink-0 " +
                                        "place-items-center rounded-2xl " +
                                        "bg-primary/10 text-primary"
                                    }
                                >
                                    <ChartNoAxesCombined
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-semibold">
                                        Demand forecasting
                                    </h2>
                                    <p
                                        className={
                                            "mt-1 text-xs leading-5 " +
                                            "text-muted-foreground"
                                        }
                                    >
                                        Plan your next order from recent sales.
                                    </p>
                                </div>
                            </header>
                            <DemandForecastCard
                                forecast={dashboard.data.forecasts[0]}
                            />
                        </section>
                        <div className={tile}>
                            <ReorderAssistant
                                forecasts={dashboard.data.forecasts}
                            />
                        </div>
                    </div>
                </FeatureGate>
            )}
        </div>
    );
}

function InventoryAnomaliesPanel({
    dashboard,
}: {
    dashboard: ReturnType<typeof useDashboard>;
}) {
    if (!dashboard.data) {
        return (
            <DashboardDataState
                error={dashboard.error}
                isLoading={dashboard.isLoading}
                isPaused={dashboard.isPaused}
                label="inventory anomalies"
            />
        );
    }

    return (
        <div className={tile}>
            <AnomalyList anomalies={dashboard.data.anomalies} />
        </div>
    );
}

function DashboardDataState({
    error,
    isLoading,
    isPaused,
    label,
}: {
    error: unknown;
    isLoading: boolean;
    isPaused: boolean;
    label: string;
}) {
    if (isPaused) {
        return (
            <div className={tile + " p-5 text-sm text-muted-foreground"}>
                This {label} is not saved offline yet. Reconnect to load it.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                aria-busy="true"
                aria-label={`Loading ${label}`}
                className={tile + " p-5"}
            >
                <div className="h-5 w-40 animate-pulse rounded-2xl bg-muted" />
                <div
                    className={
                        "mt-5 h-56 animate-pulse rounded-2xl bg-muted/50"
                    }
                />
            </div>
        );
    }

    return (
        <div className={tile + " p-5 text-sm text-destructive"}>
            Unable to load {label}:{" "}
            {error instanceof Error ? error.message : "Please try again."}
        </div>
    );
}

function DashboardPageLoading() {
    return (
        <div aria-busy="true" aria-label="Loading dashboard" className="pb-12">
            <div className="grid gap-4 px-1 py-2 xl:grid-cols-3">
                <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                <div className="h-12 animate-pulse rounded-2xl bg-muted" />
                <div className="h-12 animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="mt-4 h-96 animate-pulse rounded-2xl bg-muted/50" />
        </div>
    );
}

function toDashboardTab(value: string | null): DashboardTab {
    const match = dashboardTabs.find((tab) => tab.value === value);
    return match?.value ?? "overview";
}

function shouldIgnoreTabSwipe(target: EventTarget | null) {
    if (!(target instanceof Element)) return true;

    return Boolean(
        target.closest(
            "a, button, input, select, textarea, canvas, svg, " +
                '[role="button"], [role="slider"], ' +
                "[data-dashboard-swipe-ignore]",
        ),
    );
}
