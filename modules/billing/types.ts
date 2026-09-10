export type SubscriptionPlan = "free" | "pro" | "business";

export type SubscriptionFeature =
    | "offline_sync"
    | "ai_insights"
    | "forecasting"
    | "reorder_assistant"
    | "weekly_owner_summary"
    | "custom_roles";

export type SubscriptionSummary = {
    plan: SubscriptionPlan;
    monthly_price_php: number;
    additional_member_price_php: number | null;
    additional_member_seats: number;
    trial_eligible: boolean;
    status: string;
    provider: string;
    trial_ends_at: string | null;
    current_period_ends_at: string | null;
    cancel_at_period_end: boolean;
    limits: {
        active_sku_limit: number | null;
        included_member_limit: number | null;
        member_limit: number | null;
        max_member_limit: number | null;
        ai_insights_weekly: number | null;
    };
    features: Record<SubscriptionFeature, boolean>;
    usage: {
        active_skus: number;
        active_members: number;
        ai_insights: number;
        ai_period_start: string;
    };
};

export type UpgradeReason = {
    code?: string;
    feature?: string;
    current_plan?: string;
    limit?: number;
    message?: string;
    title?: string;
    target_plan?: "pro" | "business";
};
