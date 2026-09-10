"use client";

import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/modules/billing/services/billing";
import type { SubscriptionFeature } from "@/modules/billing/types";
import { requestPlanUpgrade } from "@/modules/billing/upgrade-events";

export function FeatureGate({
    children,
    className,
    description,
    feature,
    title,
}: {
    children: ReactNode;
    className?: string;
    description: string;
    feature: SubscriptionFeature;
    title: string;
}) {
    const subscription = useSubscription();

    if (subscription.data?.features[feature]) {
        return children;
    }

    if (subscription.isLoading && !subscription.data) {
        return (
            <div
                className={cn(
                    "h-48 animate-pulse bg-muted/40",
                    className,
                )}
            />
        );
    }

    if (subscription.error && !subscription.data) {
        return (
            <section
                className={cn(
                    "flex min-h-48 items-center justify-center p-6",
                    "text-center",
                    className,
                )}
            >
                <div>
                    <p className="text-sm font-medium">
                        Unable to check your plan
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Reconnect and try again.
                    </p>
                    <Button
                        className="mt-3"
                        onClick={() => void subscription.refetch()}
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        Try again
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section
            className={cn(
                "flex min-h-48 items-center justify-center p-6 text-center",
                className,
            )}
        >
            <div className="max-w-sm">
                <span
                    className={
                        "mx-auto flex size-10 items-center justify-center " +
                        "rounded-2xl bg-primary/10 text-primary"
                    }
                >
                    <LockKeyhole className="size-4" />
                </span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
                <Button
                    className="mt-4"
                    onClick={() =>
                        requestPlanUpgrade({
                            feature,
                            message: description,
                            title,
                        })
                    }
                    size="sm"
                    type="button"
                >
                    View Pro plan
                </Button>
            </div>
        </section>
    );
}
