"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, RefreshCw, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    useGenerateBriefing,
    useRecommendationAction,
    useTodayBriefing,
} from "@/modules/briefings/services/briefings";
import type { BriefingRecommendation } from "@/modules/briefings/types";

type RecommendationGroup = {
    id: string;
    label: string;
    recommendations: BriefingRecommendation[];
};

const ALL_RECOMMENDATIONS = "all-recommendations";

export function DailyBriefing() {
    const { data, isLoading, error } = useTodayBriefing();
    const generate = useGenerateBriefing();
    const recommendationAction = useRecommendationAction();
    const [selectedActionId, setSelectedActionId] = useState<string | null>(
        null,
    );
    const briefing = data?.briefing;
    const active =
        briefing?.recommendations.filter(
            (item) => !item.dismissed_at && !item.resolved_at,
        ) ?? [];

    if (isLoading) {
        return <div className="h-64 animate-pulse bg-muted/40" />;
    }

    if (!briefing) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center py-8 text-center">
                    <div
                        className={
                            "mb-4 flex h-12 w-12 items-center justify-center " +
                            "rounded-full bg-primary/10 text-primary"
                        }
                    >
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold">
                        Daily Inventory Briefing
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                        Generate an explainable summary from sales, stock,
                        purchase, and physical-count data.
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
                        disabled={generate.isPending}
                        onClick={() => generate.mutate(false)}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {generate.isPending
                            ? "Analyzing inventory…"
                            : "Generate today’s briefing"}
                    </Button>
                </div>
            </div>
        );
    }

    const recap = briefing.summary.filter(Boolean).join(" ");
    const actionGroups = groupRecommendedActions(active);
    const visibleRecommendations = active.slice(0, 3);
    const selectedAction =
        selectedActionId === ALL_RECOMMENDATIONS
            ? {
                  id: ALL_RECOMMENDATIONS,
                  label: "All recommendations",
                  recommendations: active,
              }
            : actionGroups.find((group) => group.id === selectedActionId);

    return (
        <>
            <div
                className={
                    "grid min-w-0 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]"
                }
            >
                <section
                    className={
                        "min-w-0 border-b lg:border-r lg:border-b-0"
                    }
                >
                    <div className="p-4 sm:p-6">
                        <div
                            className={
                                "flex flex-col justify-between gap-4 sm:flex-row " +
                                "sm:items-start"
                            }
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-semibold">
                                        Daily Inventory Briefing
                                    </h2>
                                    <Badge variant="secondary">
                                        {briefing.narrator_provider === "groq"
                                            ? "Groq"
                                            : "Rules-based"}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Generated {new Date(
                                        briefing.generated_at,
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <Button
                                className="w-full sm:w-auto"
                                disabled={generate.isPending}
                                onClick={() => generate.mutate(true)}
                                size="sm"
                                variant="outline"
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${
                                        generate.isPending
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                />
                                Regenerate
                            </Button>
                        </div>

                        <h3
                            className={
                                "mt-6 text-lg font-semibold leading-tight " +
                                "sm:text-xl"
                            }
                        >
                            {briefing.headline}
                        </h3>
                        <ul>
                            {briefing.summary.map((item, index) => (
                                <li
                                    className="mt-2 text-sm text-muted-foreground list-disc list-inside"
                                    key={index}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 border-t pt-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Needs attention
                                    </h4>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Your most urgent products and orders to
                                        review.
                                    </p>
                                </div>
                                <Badge variant="secondary">{active.length}</Badge>
                            </div>
                            {active.length === 0 ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    All recommendations have been handled.
                                </p>
                            ) : (
                                <div className="mt-4 divide-y">
                                    {visibleRecommendations.map((item) => (
                                        <button
                                            className={
                                                "w-full p-4 text-left transition-colors " +
                                                "hover:bg-muted/50 cursor-pointer"
                                            }
                                            key={item.id}
                                            onClick={() =>
                                                setSelectedActionId(item.type)
                                            }
                                            type="button"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        item.priority === "high"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                >
                                                    {item.priority}
                                                </Badge>
                                                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                                            </div>
                                            <p className="mt-2 text-sm font-medium">
                                                {item.title}
                                            </p>
                                            <p
                                                className={
                                                    "mt-1 line-clamp-2 text-xs " +
                                                    "text-muted-foreground"
                                                }
                                            >
                                                {item.recommended_action}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {active.length > visibleRecommendations.length ? (
                                <Button
                                    className="mt-3"
                                    onClick={() =>
                                        setSelectedActionId(ALL_RECOMMENDATIONS)
                                    }
                                    size="sm"
                                    type="button"
                                    variant="default"
                                >
                                    View all {active.length} recommendations
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </section>

                <aside className="min-w-0">
                    <div className="border-b p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-semibold">Next steps</h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Start with the actions that have the
                                    greatest impact.
                                </p>
                            </div>
                            <Badge variant="secondary">{active.length}</Badge>
                        </div>
                    </div>
                    <div className="">
                        {actionGroups.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                No urgent action is needed today.
                            </p>
                        ) : (
                            <ol className="divide-y">
                                {actionGroups.map((group, index) => (
                                    <li key={group.id} className="">
                                        <Button
                                            className={
                                                "h-auto min-h-16 w-full justify-start " +
                                                "whitespace-normal rounded-none p-4 sm:p-5 " +
                                                "text-left hover:bg-muted/50 cursor-pointer"
                                            }
                                            onClick={() =>
                                                setSelectedActionId(group.id)
                                            }
                                            size="sm"
                                            type="button"
                                            variant="ghost"
                                        >
                                            <span
                                                className={
                                                    "flex size-7 shrink-0 items-center " +
                                                    "justify-center rounded-full bg-primary " +
                                                    "text-xs font-semibold " +
                                                    "text-primary-foreground"
                                                }
                                            >
                                                {index + 1}
                                            </span>
                                            <span className="ml-3 min-w-0 flex-1">
                                                <span className="block text-sm font-medium">
                                                    {group.label}
                                                </span>
                                                <span
                                                    className={
                                                        "mt-0.5 block text-xs " +
                                                        "font-normal text-muted-foreground"
                                                    }
                                                >
                                                    View items and supporting evidence
                                                </span>
                                            </span>
                                            <ArrowRight
                                                className={
                                                    "ml-2 size-4 shrink-0 " +
                                                    "text-muted-foreground"
                                                }
                                            />
                                        </Button>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </aside>
            </div>

            <RecommendationDrawer
                group={selectedAction}
                isPending={recommendationAction.isPending}
                onOpenChange={(open) => {
                    if (!open) setSelectedActionId(null);
                }}
                onRecommendationAction={(id, action) =>
                    recommendationAction.mutate({ id, action })
                }
            />
        </>
    );
}

function RecommendationDrawer({
    group,
    isPending,
    onOpenChange,
    onRecommendationAction,
}: {
    group: RecommendationGroup | undefined;
    isPending: boolean;
    onOpenChange: (open: boolean) => void;
    onRecommendationAction: (
        id: string,
        action: "dismiss" | "resolve",
    ) => void;
}) {
    return (
        <Drawer
            onOpenChange={onOpenChange}
            open={Boolean(group)}
            swipeDirection="right"
        >
            <DrawerContent
                className={
                    "m-0 rounded-none border-0 " +
                    "[--drawer-content-width:100%] sm:[--drawer-content-width:32rem]"
                }
            >
                <DrawerHeader className="border-b p-5 pr-14">
                    <DrawerTitle>{group?.label ?? "Recommendations"}</DrawerTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review the supporting evidence, then resolve or dismiss
                        each recommendation.
                    </p>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                        {group?.recommendations.map((item) => (
                            <article
                                className="border bg-muted/30 p-4 rounded-md"
                                key={item.id}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            item.priority === "high"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {item.priority}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Confidence: {item.confidence}
                                    </span>
                                </div>
                                <h4 className="mt-2 font-semibold">
                                    {item.title}
                                </h4>
                                <p className="mt-1 text-sm">
                                    {item.recommended_action}
                                </p>
                                <details className="mt-3">
                                    <summary
                                        className={
                                            "cursor-pointer text-sm font-medium " +
                                            "text-primary"
                                        }
                                    >
                                        Why this was recommended
                                    </summary>
                                    <ul
                                        className={
                                            "mt-2 space-y-1 text-sm " +
                                            "text-muted-foreground"
                                        }
                                    >
                                        {item.evidence.map((evidence) => (
                                            <li key={evidence}>• {evidence}</li>
                                        ))}
                                    </ul>
                                </details>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        disabled={isPending}
                                        onClick={() =>
                                            onRecommendationAction(
                                                item.id,
                                                "dismiss",
                                            )
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        <X className="mr-1 size-4" />
                                        Dismiss
                                    </Button>
                                    <Button
                                        disabled={isPending}
                                        onClick={() =>
                                            onRecommendationAction(
                                                item.id,
                                                "resolve",
                                            )
                                        }
                                        size="sm"
                                    >
                                        <Check className="mr-1 size-4" />
                                        Resolve
                                    </Button>
                                    {item.product_id && (
                                        <Link
                                            className={buttonVariants({
                                                size: "sm",
                                                variant: "ghost",
                                            })}
                                            href="/products"
                                        >
                                            Product
                                        </Link>
                                    )}
                                    {item.purchase_id && (
                                        <Link
                                            className={buttonVariants({
                                                size: "sm",
                                                variant: "ghost",
                                            })}
                                            href={`/purchases/${item.purchase_id}`}
                                        >
                                            Purchase
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function groupRecommendedActions(
    recommendations: BriefingRecommendation[],
): RecommendationGroup[] {
    const groups = new Map<string, BriefingRecommendation[]>();

    recommendations.forEach((recommendation) => {
        const existing = groups.get(recommendation.type) ?? [];
        existing.push(recommendation);
        groups.set(recommendation.type, existing);
    });

    return Array.from(groups.entries()).map(([type, items]) => ({
        id: type,
        label: recommendationActionLabel(type, items),
        recommendations: items,
    }));
}

function recommendationActionLabel(
    type: string,
    recommendations: BriefingRecommendation[],
) {
    const count = recommendations.length;
    const productLabel = count === 1 ? "product" : "products";

    switch (type) {
        case "stockout_risk":
            return `Review ${count} ${productLabel} at risk of running out`;
        case "low_stock":
            return `Review ${count} low-stock ${productLabel}`;
        case "dead_stock":
            return `Act on ${count} dead-stock ${productLabel}`;
        case "overdue_purchase":
            return `Follow up on ${count} overdue purchase order${
                count === 1 ? "" : "s"
            }`;
        case "count_variance":
            return `Verify ${count} inventory count discrepanc${
                count === 1 ? "y" : "ies"
            }`;
        default:
            return recommendations[0].recommended_action;
    }
}
