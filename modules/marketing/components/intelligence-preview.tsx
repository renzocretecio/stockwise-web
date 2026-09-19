"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChartNoAxesCombined,
  FileText,
  Newspaper,
  PackagePlus,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

type IntelligenceView = {
  description: string;
  id: string;
  icon: LucideIcon;
  label: string;
  question: string;
};

const views: IntelligenceView[] = [
  {
    description: "A daily explanation of sales, stock, and exceptions.",
    id: "briefing",
    icon: Newspaper,
    label: "Daily briefing",
    question: "What happened?",
  },
  {
    description: "Expected demand based on recorded sales history.",
    id: "forecast",
    icon: ChartNoAxesCombined,
    label: "Demand forecast",
    question: "What may sell next?",
  },
  {
    description: "Suggested quantities using stock, demand, and lead time.",
    id: "reorder",
    icon: PackagePlus,
    label: "Reorder assistant",
    question: "What should I order?",
  },
  {
    description: "Plain-language context for unusual stock changes.",
    id: "anomaly",
    icon: TriangleAlert,
    label: "Anomaly explanation",
    question: "What needs investigating?",
  },
  {
    description: "A concise reading of already-calculated report totals.",
    id: "summary",
    icon: FileText,
    label: "Report summary",
    question: "What matters in this period?",
  },
];

export function IntelligencePreview() {
  const [activeView, setActiveView] = useState(views[0].id);
  const active = views.find((view) => view.id === activeView) ?? views[0];

  return (
    <div
      className={
        "overflow-hidden rounded-2xl border border-white/15 " +
        "bg-background shadow-2xl shadow-black/20"
      }
    >
      <div className="grid min-w-0 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div
          aria-label="Inventory intelligence examples"
          className={
            "border-b border-white/10 p-3 lg:border-r " + "lg:border-b-0 lg:p-4"
          }
          role="group"
        >
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = view.id === active.id;

            return (
              <button
                aria-pressed={isActive}
                className={
                  "group flex w-full items-start gap-3 " +
                  "rounded-2xl px-3 py-3 text-left " +
                  "transition-colors duration-200 " +
                  "focus-visible:outline-2 " +
                  "focus-visible:outline-offset-2 " +
                  "focus-visible:outline-primary " +
                  (isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-white/70 hover:bg-white/5 " + "hover:text-white")
                }
                key={view.id}
                onClick={() => setActiveView(view.id)}
                type="button"
              >
                <span
                  className={
                    "mt-0.5 grid size-8 shrink-0 " +
                    "place-items-center rounded-xl " +
                    (isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-white/10 text-white/70")
                  }
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {view.label}
                  </span>
                  <span
                    className={
                      "mt-0.5 block text-xs leading-5 " +
                      (isActive ? "text-muted-foreground" : "text-white/45")
                    }
                  >
                    {view.question}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className={
                    "ml-auto mt-2 size-3.5 shrink-0 " +
                    (isActive ? "text-accent-foreground" : "text-white/25")
                  }
                />
              </button>
            );
          })}
        </div>

        <div className="min-w-0 bg-secondary p-4 sm:p-6 lg:p-8">
          <div
            className={
              "flex flex-col gap-3 border-b border-border " +
              "pb-5 sm:flex-row sm:items-start " +
              "sm:justify-between"
            }
          >
            <div>
              <p
                className={
                  "text-xs font-semibold uppercase " +
                  "tracking-[0.16em] text-accent-foreground"
                }
              >
                {active.label}
              </p>
              <p
                className={
                  "mt-2 max-w-xl text-sm leading-6 " + "text-muted-foreground"
                }
              >
                {active.description}
              </p>
            </div>
            <span
              className={
                "inline-flex w-fit items-center gap-1.5 " +
                "rounded-full bg-accent px-3 py-1.5 " +
                "text-[0.7rem] font-semibold text-accent-foreground"
              }
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              Illustrative preview
            </span>
          </div>

          <div className="pt-6" key={active.id}>
            <IntelligenceResult view={active.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelligenceResult({ view }: { view: string }) {
  switch (view) {
    case "forecast":
      return <ForecastResult />;
    case "reorder":
      return <ReorderResult />;
    case "anomaly":
      return <AnomalyResult />;
    case "summary":
      return <SummaryResult />;
    default:
      return <BriefingResult />;
  }
}

function BriefingResult() {
  return (
    <div>
      <p className="text-xs text-muted-foreground">Generated Sep 18, 8:02 AM</p>
      <h3
        className={
          "mt-4 max-w-2xl text-2xl font-semibold leading-tight " +
          "tracking-[-0.035em] text-foreground sm:text-3xl"
        }
      >
        Sales slowed yesterday, while one stock issue needs attention.
      </h3>
      <p className={"mt-4 max-w-2xl text-sm leading-7 text-muted-foreground"}>
        The store recorded 2 sales totaling ₱782 with ₱179 in gross profit.
        Sales were down 49.9% from the previous period, and Wireless Earbuds may
        run out soon.
      </p>
      <div className="mt-7 grid gap-px sm:grid-cols-3">
        <BriefingMetric label="Sales" value="₱782" />
        <BriefingMetric label="Gross profit" value="₱179" />
        <BriefingMetric label="Urgent action" value="1 product" />
      </div>
    </div>
  );
}

function ForecastResult() {
  const points = [18, 28, 24, 38, 31, 46, 42, 58, 51, 68, 64, 77];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">
            Wireless Earbuds
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Seven-day supplier lead time
          </p>
        </div>
        <span
          className={
            "rounded-full bg-accent px-3 py-1.5 text-xs " +
            "font-semibold text-accent-foreground"
          }
        >
          High confidence
        </span>
      </div>
      <div
        aria-label="Illustrative upward demand trend"
        className={
          "mt-8 flex h-40 items-end gap-2 border-b " + "border-border px-2"
        }
      >
        {points.map((point, index) => (
          <span
            className={
              "min-w-0 flex-1 rounded-t-md bg-[#6f9aa5] " +
              "transition-colors hover:bg-primary"
            }
            key={index}
            style={{ height: `${point}%` }}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Lead-time demand" value="14.2 units" />
        <SmallMetric label="Available" value="18 units" />
        <SmallMetric label="Incoming" value="0 units" />
      </div>
    </div>
  );
}

function ReorderResult() {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Based on sales, available stock, incoming stock, and lead time
      </p>
      <div
        className={
          "mt-6 rounded-2xl border border-border bg-card p-5 " + "sm:p-6"
        }
      >
        <div
          className={
            "flex flex-col gap-5 sm:flex-row sm:items-center " +
            "sm:justify-between"
          }
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              Wireless Earbuds
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo Tech Distribution · 7-day lead time
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">Recommended order</p>
            <p
              className={
                "mt-1 text-3xl font-semibold tracking-tight " +
                "text-accent-foreground"
              }
            >
              7 units
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SmallMetric label="Available" value="18" />
          <SmallMetric label="Incoming" value="0" />
          <SmallMetric label="Needed in lead time" value="14.2" />
        </div>
        <div
          className={
            "mt-4 flex items-center justify-between gap-3 " +
            "rounded-xl bg-accent px-4 py-3"
          }
        >
          <p className="text-sm text-muted-foreground">
            Order by <strong>Sep 19</strong>
          </p>
          <span className="text-xs font-semibold text-accent-foreground">
            Create draft
          </span>
        </div>
      </div>
    </div>
  );
}

function AnomalyResult() {
  return (
    <div>
      <div
        className={
          "rounded-2xl border border-border bg-[#fff4df] p-5 " + "sm:p-6"
        }
      >
        <div className={"flex flex-wrap items-start justify-between gap-3"}>
          <div>
            <p
              className={
                "text-xs font-semibold uppercase " +
                "tracking-wide text-[#8a5a1e]"
              }
            >
              Count discrepancy
            </p>
            <h3 className={"mt-2 text-xl font-semibold text-foreground"}>
              Organic Coffee Beans
            </h3>
          </div>
          <span
            className={
              "rounded-full bg-[#fff4df] px-3 py-1 text-xs " +
              "font-semibold text-[#8a5a1e]"
            }
          >
            High severity
          </span>
        </div>
        <div className="mt-7 flex items-end gap-3">
          <span
            className={
              "text-5xl font-semibold tracking-tight " + "text-[#a43f45]"
            }
          >
            −12
          </span>
          <span className="pb-1 text-sm text-muted-foreground">units</span>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Verify the physical count, spoilage, returns, or recent data entry
          before adjusting the balance.
        </p>
      </div>
    </div>
  );
}

function SummaryResult() {
  return (
    <div>
      <div className="grid gap-px bg-border sm:grid-cols-3">
        <BriefingMetric label="Revenue" value="₱182,450" />
        <BriefingMetric label="Gross profit" value="₱52,430" />
        <BriefingMetric label="Sales" value="918" />
      </div>
      <div
        className={
          "mt-6 border-l-2 border-[#6f9aa5] pl-5 text-lg " +
          "leading-8 text-muted-foreground"
        }
      >
        Sales increased 8.3% from the previous period. Wireless Earbuds made the
        strongest contribution, while Phone Cases moved slowly. Returns remained
        low relative to total sales.
      </div>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        The summary receives compact metrics and rankings—not raw transaction
        rows.
      </p>
    </div>
  );
}

function BriefingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={"bg-card px-4 py-4 first:rounded-l-xl " + "last:rounded-r-xl"}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
