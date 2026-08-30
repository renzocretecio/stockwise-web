"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DailyBriefing } from "@/modules/briefings/components/daily-briefing";
import { AnomalyList } from "@/modules/dashboard/components/anomaly-list";
import { DemandForecastCard } from
  "@/modules/dashboard/components/demand-forecast-card";
import { KpiCards } from "@/modules/dashboard/components/kpi-cards";
import { useDashboard } from "@/modules/dashboard/services/dashboard";
import { AskAi } from "@/modules/intelligence/components/ask-ai";

const links = [
  { href: "/inventory/overview", label: "Stock overview", icon: Package },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  {
    href: "/inventory/movements",
    label: "Stock movements",
    icon: ArrowLeftRight,
  },
  { href: "/reports/sales", label: "Reports", icon: BarChart3 },
];

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const today = new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what needs attention in your inventory today.
          </p>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">
          {today}
        </p>
      </div>
      <DailyBriefing />
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : error || !data ? (
        <Card className="border-destructive/30 p-5 text-sm text-destructive">
          Unable to load dashboard analysis:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Card>
      ) : (
        <>
          <KpiCards kpis={data.kpis} />
          <DemandForecastCard forecast={data.forecasts[0]} />
          <AnomalyList anomalies={data.anomalies} />
        </>
      )}
      <AskAi />
      <div>
        <h2
          className={
            "mb-3 text-sm font-semibold uppercase tracking-wider " +
            "text-muted-foreground"
          }
        >
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card
                className={
                  "flex items-center gap-3 p-4 transition-colors " +
                  "hover:bg-muted/40"
                }
              >
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center " +
                    "rounded-xl bg-primary/10 text-primary"
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
