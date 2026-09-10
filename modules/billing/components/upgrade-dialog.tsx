"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { UpgradeReason } from "@/modules/billing/types";
import { UPGRADE_REQUIRED_EVENT } from
    "@/modules/billing/upgrade-events";

const planOptions = {
    pro: {
        benefits: [
            "Up to 500 active SKUs",
            "Up to 3 members",
            "Add up to 7 seats for ₱79 each per month",
            "30 AI actions every week",
            "Offline operations and automatic sync",
            "Weekly owner summary",
            "14-day free trial for eligible businesses",
        ],
        label: "StockWise Pro",
        price: "₱299/month",
    },
    business: {
        benefits: [
            "Up to 10,000 active SKUs",
            "Up to 25 members",
            "150 AI actions every week",
            "Everything included in Pro",
            "Custom roles",
        ],
        label: "StockWise Business",
        price: "₱899/month",
    },
};

export function UpgradeDialog() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<UpgradeReason>({});
    const targetPlan = reason.target_plan
        ? planOptions[reason.target_plan]
        : reason.current_plan === "free" || !reason.current_plan
            ? planOptions.pro
            : planOptions.business;

    useEffect(() => {
        const showDialog = (event: Event) => {
            const customEvent = event as CustomEvent<UpgradeReason>;
            setReason(customEvent.detail ?? {});
            setOpen(true);
        };

        window.addEventListener(UPGRADE_REQUIRED_EVENT, showDialog);
        return () => {
            window.removeEventListener(UPGRADE_REQUIRED_EVENT, showDialog);
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div
                        className={
                            "mb-2 flex size-10 items-center justify-center " +
                            "rounded-2xl bg-primary/10 text-primary"
                        }
                    >
                        <Sparkles className="size-5" />
                    </div>
                    <DialogTitle>
                        {reason.title ?? "Upgrade to unlock this feature"}
                    </DialogTitle>
                    <DialogDescription>
                        {reason.message ??
                            "This feature is not included in your " +
                                "current plan."}
                    </DialogDescription>
                </DialogHeader>

                <div className="border-y py-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold">
                            {targetPlan.label}
                        </p>
                        <p className="text-sm font-semibold">
                            {targetPlan.price}
                        </p>
                    </div>
                    <ul className="mt-3 space-y-2">
                        {targetPlan.benefits.map((benefit) => (
                            <li
                                className={
                                    "flex items-center gap-2 text-sm " +
                                    "text-muted-foreground"
                                }
                                key={benefit}
                            >
                                <Check className="size-4 text-primary" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-muted-foreground">
                    Online checkout is not connected yet. Plan upgrades can be
                    activated by the StockWise administrator.
                </p>
                <DialogFooter>
                    <Button
                        onClick={() => setOpen(false)}
                        type="button"
                        variant="outline"
                    >
                        Not now
                    </Button>
                    <Button onClick={() => setOpen(false)} type="button">
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
