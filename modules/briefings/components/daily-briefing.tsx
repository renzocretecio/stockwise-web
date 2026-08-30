"use client";

import Link from "next/link";
import { Bot, Check, ChevronRight, RefreshCw, Sparkles, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGenerateBriefing,
  useRecommendationAction,
  useTodayBriefing,
} from "@/modules/briefings/services/briefings";

export function DailyBriefing() {
  const { data, isLoading, error } = useTodayBriefing();
  const generate = useGenerateBriefing();
  const action = useRecommendationAction();
  const briefing = data?.briefing;
  const active =
    briefing?.recommendations.filter(
      (item) => !item.dismissed_at && !item.resolved_at,
    ) ?? [];

  if (isLoading) return <Card className="h-64 animate-pulse bg-muted/40" />;

  if (!briefing)
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center py-8 text-center">
          <div
            className={
              "mb-4 flex h-12 w-12 items-center justify-center rounded-full " +
              "bg-primary/10 text-primary"
            }
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">Daily Inventory Briefing</h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Generate an explainable summary from sales, stock, purchase, and
            physical-count data.
          </p>
          {(error || generate.error) && (
            <p className="mt-3 text-sm text-destructive">
              {(error ?? generate.error) instanceof Error
                ? (error ?? generate.error)?.message
                : "Unable to generate briefing."}
            </p>
          )}
          <Button
            className="mt-5"
            onClick={() => generate.mutate(false)}
            disabled={generate.isPending}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {generate.isPending
              ? "Analyzing inventory…"
              : "Generate today’s briefing"}
          </Button>
        </div>
      </Card>
    );

  return (
    <Card className="overflow-hidden">
      <div
        className={
          "border-b bg-gradient-to-r from-primary/10 via-primary/5 " +
          "to-transparent p-6"
        }
      >
        <div
          className={
            "flex flex-col justify-between gap-4 sm:flex-row " +
            "sm:items-start"
          }
        >
          <div className="flex gap-3">
            <div
              className={
                "flex h-11 w-11 shrink-0 items-center justify-center " +
                "rounded-xl bg-primary text-primary-foreground"
              }
            >
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">
                  Daily Inventory Briefing
                </h2>
                <Badge variant="secondary">
                  {briefing.narrator_provider === "gemini"
                    ? "Gemini"
                    : "Rules-based"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Generated {new Date(briefing.generated_at).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={generate.isPending}
            onClick={() => generate.mutate(true)}
          >
            <RefreshCw
              className={
                `mr-2 h-4 w-4 ${
                  generate.isPending ? "animate-spin" : ""
                }`
              }
            />
            Regenerate
          </Button>
        </div>
        <h3 className="mt-5 text-lg font-semibold">{briefing.headline}</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {briefing.summary.map((line) => (
            <li key={line} className="flex gap-2">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="divide-y">
        {active.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            All recommendations have been handled.
          </p>
        ) : (
          active.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        item.priority === "high" ? "destructive" : "secondary"
                      }
                    >
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {item.confidence}
                    </span>
                  </div>
                  <h4 className="mt-2 font-semibold">{item.title}</h4>
                  <p className="mt-1 text-sm">{item.recommended_action}</p>
                  <details className="mt-3">
                    <summary
                      className={
                        "cursor-pointer text-sm font-medium text-primary"
                      }
                    >
                      Why this was recommended
                    </summary>
                    <ul
                      className={
                        "mt-2 space-y-1 text-sm text-muted-foreground"
                      }
                    >
                      {item.evidence.map((evidence) => (
                        <li key={evidence}>• {evidence}</li>
                      ))}
                    </ul>
                  </details>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      action.mutate({ id: item.id, action: "dismiss" })
                    }
                  >
                    <X className="mr-1 h-4 w-4" />
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      action.mutate({ id: item.id, action: "resolve" })
                    }
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Resolve
                  </Button>
                  {item.product_id && (
                    <Link
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      href="/products"
                    >
                      Product
                    </Link>
                  )}
                  {item.purchase_id && (
                    <Link
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      href={`/purchases/${item.purchase_id}`}
                    >
                      Purchase
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
