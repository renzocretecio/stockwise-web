"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ListChecks, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    useRecommendationAction,
    useTodayBriefing,
} from "@/modules/briefings/services/briefings";
import type { BriefingRecommendation } from "@/modules/briefings/types";

type RecommendationGroup = {
    id: string;
    label: string;
    recommendations: BriefingRecommendation[];
};

export function TodayPriorities() {
    const { data, error, isLoading } = useTodayBriefing();
    const recommendationAction = useRecommendationAction();
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const active =
        data?.briefing?.recommendations.filter(
            (item) => !item.dismissed_at && !item.resolved_at,
        ) ?? [];
    const groups = groupRecommendedActions(active);
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);

    if (isLoading) {
        return (
            <section
                aria-busy
                aria-label="Loading today's priorities"
                className="h-full min-h-80 animate-pulse bg-muted/30"
            />
        );
    }

    return (
        <>
            <section className="@container/priorities flex h-full min-w-0 flex-col gap-4 p-3">
                <header
                    className={
                        "flex flex-col gap-3 " +
                        "@min-[360px]/priorities:flex-row " +
                        "@min-[360px]/priorities:items-start " +
                        "@min-[360px]/priorities:justify-between"
                    }
                >
                    <div className="flex min-w-0 items-start gap-3">
                        <span
                            className={
                                "grid size-10 shrink-0 place-items-center " +
                                "rounded-2xl bg-primary/10 text-primary"
                            }
                        >
                            <ListChecks className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold">
                                Top priorities
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Start with the highest-impact action.
                            </p>
                        </div>
                    </div>
                    <Badge className="shrink-0" variant="secondary">
                        {active.length} action{active.length === 1 ? "" : "s"}
                    </Badge>
                </header>

                {error && !data ? (
                    <p className="p-6 text-sm text-destructive">
                        Unable to load today&apos;s priorities.
                    </p>
                ) : groups.length === 0 ? (
                    <div className="grid min-h-56 flex-1 place-items-center p-6 text-center">
                        <div>
                            <span
                                className={
                                    "mx-auto grid size-10 place-items-center " +
                                    "rounded-2xl bg-primary/10 text-primary"
                                }
                            >
                                <Check className="size-5" />
                            </span>
                            <p className="mt-3 text-sm font-medium">
                                You&apos;re all caught up
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                No urgent action is recommended today.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <ol
                            className={
                                "mt-3 grid max-h-72 gap-2 overflow-y-auto " +
                                "pr-1"
                            }
                        >
                            {groups.map((group, index) => {
                                const highPriority = group.recommendations.some(
                                    (item) => item.priority === "high",
                                );

                                return (
                                    <li key={group.id}>
                                        <button
                                            className={
                                                "group flex min-h-20 w-full items-center " +
                                                "rounded-2xl border border-border/60 " +
                                                "bg-muted/20 p-3 text-left transition-colors " +
                                                "hover:border-primary/30 hover:bg-primary/5 " +
                                                "focus-visible:outline-none " +
                                                "focus-visible:ring-2 focus-visible:ring-ring"
                                            }
                                            onClick={() =>
                                                setSelectedGroupId(group.id)
                                            }
                                            type="button"
                                        >
                                            <span
                                                className={
                                                    "grid size-8 shrink-0 place-items-center " +
                                                    "rounded-2xl text-xs font-semibold " +
                                                    (highPriority
                                                        ? "bg-destructive text-destructive-foreground"
                                                        : "bg-primary text-primary-foreground")
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
                                                        "mt-1 block text-xs " +
                                                        "text-muted-foreground"
                                                    }
                                                >
                                                    {formatItemCount(
                                                        group.recommendations
                                                            .length,
                                                    )}
                                                    {highPriority
                                                        ? " · High priority"
                                                        : " · Open details"}
                                                </span>
                                            </span>
                                            <ArrowRight
                                                className={
                                                    "ml-3 size-4 shrink-0 " +
                                                    "text-muted-foreground " +
                                                    "transition-transform " +
                                                    "group-hover:translate-x-0.5"
                                                }
                                            />
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}
            </section>

            <PriorityDrawer
                group={selectedGroup}
                isPending={recommendationAction.isPending}
                onOpenChange={(open) => {
                    if (!open) setSelectedGroupId(null);
                }}
                onRecommendationAction={(id, action) => {
                    recommendationAction.mutate(
                        { action, id },
                        {
                            onSuccess: () => setSelectedGroupId(null),
                        },
                    );
                }}
            />
        </>
    );
}

function PriorityDrawer({
    group,
    isPending,
    onOpenChange,
    onRecommendationAction,
}: {
    group?: RecommendationGroup;
    isPending: boolean;
    onOpenChange: (open: boolean) => void;
    onRecommendationAction: (id: string, action: "dismiss" | "resolve") => void;
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
                    "[--drawer-content-width:100%] " +
                    "sm:[--drawer-content-width:32rem]"
                }
            >
                <DrawerHeader className="border-b p-5 pr-14">
                    <DrawerTitle>{group?.label ?? "Priority"}</DrawerTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review the evidence, then resolve or dismiss each item.
                    </p>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                        {group?.recommendations.map((item) => (
                            <article
                                className="rounded-2xl border bg-muted/30 p-4"
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
                                <h3 className="mt-3 font-semibold">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-sm leading-6">
                                    {item.recommended_action}
                                </p>
                                {item.evidence.length ? (
                                    <details className="mt-3">
                                        <summary
                                            className={
                                                "cursor-pointer text-sm " +
                                                "font-medium text-primary"
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
                                                <li key={evidence}>
                                                    • {evidence}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                ) : null}
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
                                        type="button"
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
                                        type="button"
                                    >
                                        <Check className="mr-1 size-4" />
                                        Resolve
                                    </Button>
                                    {item.product_id ? (
                                        <Link
                                            className={buttonVariants({
                                                size: "sm",
                                                variant: "ghost",
                                            })}
                                            href="/products"
                                        >
                                            Product
                                        </Link>
                                    ) : null}
                                    {item.purchase_id ? (
                                        <Link
                                            className={buttonVariants({
                                                size: "sm",
                                                variant: "ghost",
                                            })}
                                            href={`/purchases/${item.purchase_id}`}
                                        >
                                            Purchase
                                        </Link>
                                    ) : null}
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
    const product = count === 1 ? "product" : "products";

    switch (type) {
        case "stockout_risk":
            return `Review ${count} ${product} at risk of running out`;
        case "low_stock":
            return `Review ${count} low-stock ${product}`;
        case "dead_stock":
            return `Act on ${count} dead-stock ${product}`;
        case "overdue_purchase":
            return `Follow up on ${count} overdue purchase order${
                count === 1 ? "" : "s"
            }`;
        case "count_variance":
            return `Verify ${count} inventory count discrepanc${
                count === 1 ? "y" : "ies"
            }`;
        default:
            return recommendations[0]?.recommended_action ?? "Review item";
    }
}

function formatItemCount(count: number) {
    return `${count} ${count === 1 ? "item" : "items"}`;
}
