"use client";

import { BadgeCheck, Bot, Boxes, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import {
  useStartProTrial,
  useSubscription,
} from "@/modules/billing/services/billing";
import type { SubscriptionSummary } from "@/modules/billing/types";
import { requestPlanUpgrade } from "@/modules/billing/upgrade-events";

export function PlanSettings() {
  const { data, isLoading, error, refetch } = useSubscription();
  const startTrial = useStartProTrial();
  const canManageBilling = useHasPermission("billing.manage");

  if (isLoading && !data) {
    return <div className="h-80 animate-pulse bg-muted/40" />;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-destructive">
          Unable to load plan details.
        </p>
        <Button
          className="mt-3"
          onClick={() => void refetch()}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <header className={"flex items-start justify-between gap-4 border-b p-5"}>
        <div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-primary" />
            <h2 className="font-semibold">Plan and usage</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Review the limits for the active business.
          </p>
        </div>
        <span
          className={
            "rounded-full bg-primary/10 px-3 py-1 text-xs " +
            "font-semibold capitalize text-primary"
          }
        >
          {data.plan}
          {data.status === "trialing" ? " trial" : ""}
          {" · "}
          {data.status === "trialing"
            ? "Free for 14 days"
            : formatPlanPrice(data.monthly_price_php, data.billing_interval)}
        </span>
      </header>

      <TrialNotice subscription={data} />
      <ManualRenewalNotice subscription={data} />

      <div className="grid gap-px bg-border sm:grid-cols-3">
        <UsageItem
          icon={Boxes}
          label="Active SKUs"
          limit={data.limits.active_sku_limit}
          used={data.usage.active_skus}
        />
        <UsageItem
          icon={Bot}
          label="AI actions this week"
          limit={data.limits.ai_insights_weekly}
          used={data.usage.ai_insights}
        />
        <UsageItem
          icon={Users}
          label="Active members"
          limit={data.limits.member_limit}
          used={data.usage.active_members}
        />
      </div>

      {data.plan === "pro" ? <SeatSummary subscription={data} /> : null}

      <div className="border-t p-5">
        <h3 className="text-sm font-semibold">Included features</h3>
        <div
          className={"mt-3 grid gap-x-6 gap-y-2 text-sm " + "sm:grid-cols-2"}
        >
          <Feature
            included={data.features.ai_insights}
            label="AI explanations"
          />
          <Feature
            included={data.features.forecasting}
            label="Demand forecasting"
          />
          <Feature
            included={data.features.reorder_assistant}
            label="Reorder assistant"
          />
          <Feature included={data.features.offline_sync} label="Offline mode" />
          <Feature
            included={data.features.weekly_owner_summary}
            label="Weekly owner summary"
          />
        </div>
        {canManageBilling && data.plan === "free" && data.trial_eligible ? (
          <Button
            className="mt-5"
            disabled={startTrial.isPending}
            onClick={() => startTrial.mutate()}
            type="button"
          >
            {startTrial.isPending
              ? "Starting trial…"
              : "Start 14-day Pro trial"}
          </Button>
        ) : canManageBilling && data.plan !== "business" ? (
          <Button
            className="mt-5"
            onClick={() =>
              requestPlanUpgrade({
                current_plan: data.plan,
                target_plan: data.status === "trialing" ? "pro" : undefined,
              })
            }
            type="button"
          >
            {data.status === "trialing"
              ? "Keep Pro after trial"
              : `Explore ${data.plan === "free" ? "Pro" : "Business"}`}
          </Button>
        ) : null}
        {startTrial.error ? (
          <p className="mt-3 text-sm text-destructive">
            {startTrial.error.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TrialNotice({ subscription }: { subscription: SubscriptionSummary }) {
  if (!subscription?.trial_ends_at) {
    return null;
  }

  if (subscription.status === "trialing") {
    const affectedMembers = Math.max(subscription.usage.active_members - 1, 0);

    return (
      <div className="border-b bg-primary/5 p-5 text-sm">
        <p className="font-medium">Your Pro trial is active.</p>
        <p className="mt-1 text-muted-foreground">
          It ends {formatDate(subscription.trial_ends_at)}. After that, this
          business returns to Free unless Pro is activated.
        </p>
        {affectedMembers > 0 ? (
          <p
            className={
              "mt-2 font-medium text-amber-700 " + "dark:text-amber-300"
            }
          >
            {affectedMembers} team{" "}
            {affectedMembers === 1 ? "member" : "members"} will lose access when
            the trial ends.
          </p>
        ) : null}
      </div>
    );
  }

  if (subscription.status === "expired") {
    return (
      <div className="border-b bg-amber-500/10 p-5 text-sm">
        <p className="font-medium">Your paid plan has ended.</p>
        <p className="mt-1 text-muted-foreground">
          Your data is safe and this business now uses Free limits.
        </p>
      </div>
    );
  }

  return null;
}

function ManualRenewalNotice({
  subscription,
}: {
  subscription: SubscriptionSummary;
}) {
  if (
    subscription.provider !== "manual" ||
    subscription.status !== "active" ||
    !subscription.current_period_ends_at
  ) {
    return null;
  }

  return (
    <div className="border-b bg-primary/5 p-5 text-sm">
      <p className="font-medium">
        Your {subscription.plan} plan is active until{" "}
        {formatDate(subscription.current_period_ends_at)}.
      </p>
      <p className="mt-1 text-muted-foreground">
        Renewal is handled manually. Renew before this date to keep your
        paid-plan access without interruption.
      </p>
    </div>
  );
}

function SeatSummary({ subscription }: { subscription: SubscriptionSummary }) {
  const included = subscription.limits.included_member_limit ?? 3;
  const maximum = subscription.limits.max_member_limit ?? 10;
  const addOnLimit = maximum - included;

  return (
    <div className="border-t p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Additional member seats</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {included} included · {subscription.additional_member_seats} of{" "}
            {addOnLimit}
            {" additional seats added"}
          </p>
        </div>
        <p className="text-sm font-semibold">
          ₱{formatSeatPrice(subscription)}
          <span className="font-normal text-muted-foreground">
            /member/
            {subscription.billing_interval === "yearly" ? "year" : "month"}
          </span>
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {subscription.status === "trialing"
          ? "Additional seats become available after activating Pro."
          : "Seat changes are currently handled by the StockWise " +
            "administrator."}
      </p>
    </div>
  );
}

function formatPlanPrice(
  monthlyPrice: number,
  billingInterval: SubscriptionSummary["billing_interval"],
) {
  if (monthlyPrice === 0) {
    return "Free";
  }

  if (billingInterval === "yearly") {
    return `₱${(monthlyPrice * 12).toLocaleString("en-PH")}/year`;
  }

  return `₱${monthlyPrice.toLocaleString("en-PH")}/mo`;
}

function formatSeatPrice(subscription: SubscriptionSummary) {
  const monthlyPrice = subscription.additional_member_price_php ?? 79;

  return subscription.billing_interval === "yearly"
    ? (monthlyPrice * 12).toLocaleString("en-PH")
    : monthlyPrice.toLocaleString("en-PH");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function UsageItem({
  icon: Icon,
  label,
  limit,
  used,
}: {
  icon: typeof Boxes;
  label: string;
  limit: number | null;
  used?: number;
}) {
  const percentage =
    used === undefined || !limit ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums">
        {used === undefined ? `Up to ${limit ?? "unlimited"}` : used}
        {used !== undefined ? (
          <span className={"text-sm font-normal text-muted-foreground"}>
            {` / ${limit ?? "unlimited"}`}
          </span>
        ) : null}
      </p>
      {used !== undefined && limit ? (
        <div className={"mt-3 h-1.5 overflow-hidden rounded-full bg-muted"}>
          <div
            className={cn(
              "h-full rounded-full bg-primary",
              "transition-[width]",
              percentage >= 90 && "bg-amber-500",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Feature({ included, label }: { included: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          included ? "bg-emerald-500" : "bg-muted-foreground/30",
        )}
      />
      {label}
      <span className="ml-auto text-xs">{included ? "Included" : "Pro"}</span>
    </div>
  );
}
