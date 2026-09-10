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
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import {
    useCancelUpgradeRequest,
    useCreateUpgradeRequest,
    useCurrentUpgradeRequest,
    useSubmitUpgradeRequestPayment,
} from "@/modules/billing/services/billing";
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
    const [billingInterval, setBillingInterval] = useState<
        "monthly" | "yearly"
    >("monthly");
    const canManageBilling = useHasPermission("billing.manage");
    const pendingRequest = useCurrentUpgradeRequest(
        canManageBilling && open,
    );
    const createRequest = useCreateUpgradeRequest();
    const submitPayment = useSubmitUpgradeRequestPayment();
    const cancelRequest = useCancelUpgradeRequest();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const targetPlan = reason.target_plan
        ? planOptions[reason.target_plan]
        : reason.current_plan === "free" || !reason.current_plan
            ? planOptions.pro
            : planOptions.business;

    useEffect(() => {
        const showDialog = (event: Event) => {
            const customEvent = event as CustomEvent<UpgradeReason>;
            setReason(customEvent.detail ?? {});
            setBillingInterval("monthly");
            setOpen(true);
        };

        window.addEventListener(UPGRADE_REQUIRED_EVENT, showDialog);
        return () => {
            window.removeEventListener(UPGRADE_REQUIRED_EVENT, showDialog);
        };
    }, []);

    const targetPlanKey = reason.target_plan
        ? reason.target_plan
        : reason.current_plan === "free" || !reason.current_plan
            ? "pro"
            : "business";
    const quotedAmount =
        (targetPlanKey === "pro" ? 299 : 899) *
        (billingInterval === "yearly" ? 12 : 1);
    const activeRequest = pendingRequest.data;
    const requestIsPending = activeRequest?.status === "pending";
    const awaitingPayment = activeRequest?.status === "awaiting_payment";
    const paymentSubmitted = activeRequest?.status === "payment_submitted";

    const submitRequest = () => {
        createRequest.mutate(
            {
                plan: targetPlanKey,
                billing_interval: billingInterval,
            },
        );
    };

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

                {canManageBilling ? (
                    <div className="space-y-2">
                        <p className="text-xs font-medium">Billing period</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(["monthly", "yearly"] as const).map(
                                (interval) => (
                                    <Button
                                        aria-pressed={
                                            billingInterval === interval
                                        }
                                        key={interval}
                                        onClick={() =>
                                            setBillingInterval(interval)
                                        }
                                        size="sm"
                                        type="button"
                                        variant={
                                            billingInterval === interval
                                                ? "secondary"
                                                : "outline"
                                        }
                                    >
                                        {interval === "monthly"
                                            ? "Monthly"
                                            : "Yearly"}
                                    </Button>
                                ),
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total request: ₱{quotedAmount.toLocaleString("en-PH")}
                            {billingInterval === "yearly" ? "/year" : "/month"}
                        </p>
                    </div>
                ) : null}

                <p className="text-xs text-muted-foreground">
                    Payment is handled manually. We will send payment
                    instructions after reviewing your request. Your plan only
                    changes when payment is confirmed.
                </p>
                {requestIsPending ? (
                    <p className="text-sm font-medium text-primary">
                        Upgrade request received. Your current plan remains
                        active until payment is confirmed.
                    </p>
                ) : null}
                {awaitingPayment && activeRequest ? (
                    <div className="space-y-3 rounded-2xl bg-muted/50 p-3">
                        <p className="text-sm font-medium">
                            Payment instructions are ready.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {activeRequest.admin_note ||
                                "Complete the agreed manual payment, then " +
                                    "submit its reference below."}
                        </p>
                        <input
                            className="w-full rounded-2xl border bg-background px-3 py-2 text-sm"
                            onChange={(event) =>
                                setPaymentMethod(event.target.value)
                            }
                            placeholder="Payment method, e.g. GCash"
                            value={paymentMethod}
                        />
                        <input
                            className="w-full rounded-2xl border bg-background px-3 py-2 text-sm"
                            onChange={(event) =>
                                setPaymentReference(event.target.value)
                            }
                            placeholder="Transaction or reference number"
                            value={paymentReference}
                        />
                    </div>
                ) : null}
                {paymentSubmitted ? (
                    <p className="text-sm font-medium text-primary">
                        Payment reference submitted. We will activate your
                        plan once it has been confirmed.
                    </p>
                ) : null}
                {createRequest.error ? (
                    <p className="text-sm text-destructive">
                        {createRequest.error.message}
                    </p>
                ) : null}
                <DialogFooter>
                    <Button
                        onClick={() => setOpen(false)}
                        type="button"
                        variant="outline"
                    >
                        Not now
                    </Button>
                    {canManageBilling ? (
                        <div className="flex gap-2">
                            {awaitingPayment && activeRequest ? (
                                <Button
                                    disabled={
                                        submitPayment.isPending ||
                                        !paymentMethod.trim() ||
                                        !paymentReference.trim()
                                    }
                                    onClick={() =>
                                        submitPayment.mutate({
                                            id: activeRequest.id,
                                            payment_method: paymentMethod,
                                            payment_reference: paymentReference,
                                        })
                                    }
                                    type="button"
                                >
                                    Submit payment
                                </Button>
                            ) : (
                                <Button
                                    disabled={
                                        createRequest.isPending ||
                                        Boolean(activeRequest)
                                    }
                                    onClick={submitRequest}
                                    type="button"
                                >
                                    {createRequest.isPending
                                        ? "Sending request…"
                                        : activeRequest
                                            ? "Request in progress"
                                            : "Request upgrade"}
                                </Button>
                            )}
                            {activeRequest && !paymentSubmitted ? (
                                <Button
                                    disabled={cancelRequest.isPending}
                                    onClick={() =>
                                        cancelRequest.mutate(activeRequest.id)
                                    }
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel request
                                </Button>
                            ) : null}
                        </div>
                    ) : (
                        <Button onClick={() => setOpen(false)} type="button">
                            Got it
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
