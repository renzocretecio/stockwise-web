export type SubscriptionPlan = "free" | "pro" | "business";
export type BillingInterval = "monthly" | "yearly";

export type BillingAdminAccess = {
  authorized: boolean;
};

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
  billing_interval: BillingInterval;
  trial_ends_at: string | null;
  current_period_started_at: string | null;
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

export type UpgradeRequest = {
  id: string;
  business_id: string;
  business_name?: string | null;
  requested_by_name?: string | null;
  requested_by_email?: string | null;
  requested_plan: Exclude<SubscriptionPlan, "free">;
  requested_billing_interval: BillingInterval;
  requested_additional_member_seats: number;
  quoted_amount_php: number;
  status:
    | "pending"
    | "awaiting_payment"
    | "payment_submitted"
    | "approved"
    | "rejected"
    | "cancelled";
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_submitted_at?: string | null;
  admin_note?: string | null;
  approved_plan?: Exclude<SubscriptionPlan, "free"> | null;
  approved_billing_interval?: BillingInterval | null;
  approved_additional_member_seats?: number | null;
  approved_amount_php?: number | null;
  reviewed_at?: string | null;
  created_at: string;
};

export type UpgradeRequestStatus = UpgradeRequest["status"];

export type UpgradeRequestListResponse = {
  items: UpgradeRequest[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  status_counts: Partial<Record<UpgradeRequestStatus, number>>;
};

export type UpgradeRequestInput = {
  plan: Exclude<SubscriptionPlan, "free">;
  billing_interval: BillingInterval;
  additional_member_seats?: number;
};

export type PaymentSubmissionInput = {
  payment_method: string;
  payment_reference: string;
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
