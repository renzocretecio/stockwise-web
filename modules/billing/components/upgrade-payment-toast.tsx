"use client";

import { useEffect } from "react";

import { toast } from "@/components/ui/toast";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import { useSession } from "@/modules/auth/services/session";
import { useCurrentUpgradeRequest } from "@/modules/billing/services/billing";
import { requestPlanUpgrade } from "@/modules/billing/upgrade-events";

const PAYMENT_TOAST_ID = "stockwise-upgrade-payment-ready";

export function UpgradePaymentToast() {
  const session = useSession();
  const canManageBilling = useHasPermission("billing.manage");
  const isOwner =
    session.data?.active_business?.role?.toLowerCase() === "owner";
  const request = useCurrentUpgradeRequest(canManageBilling || isOwner);
  const upgradeRequest = request.data;

  useEffect(() => {
    if (upgradeRequest?.status !== "awaiting_payment") {
      toast.close(PAYMENT_TOAST_ID);
      return;
    }

    toast.add({
      id: PAYMENT_TOAST_ID,
      type: "info",
      title: "Your upgrade is ready for payment",
      description: `Submit your payment details for the ${
        upgradeRequest.requested_plan === "pro" ? "Pro" : "Business"
      } plan to continue.`,
      timeout: 0,
      priority: "high",
      actionProps: {
        children: "Submit payment",
        onClick: () => {
          requestPlanUpgrade({
            target_plan: upgradeRequest.requested_plan,
          });
        },
      },
    });

    return () => {
      toast.close(PAYMENT_TOAST_ID);
    };
  }, [upgradeRequest]);

  return null;
}
