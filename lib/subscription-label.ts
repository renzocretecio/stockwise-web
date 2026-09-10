type BusinessPlan = "free" | "pro" | "business" | undefined;

export function subscriptionLabel(
    plan: BusinessPlan,
    status?: string,
) {
    if (status === "trialing") return "Pro trial";
    if (status === "expired") return "Free";
    if (!plan) return "Plan unavailable";

    return plan.charAt(0).toUpperCase() + plan.slice(1);
}
