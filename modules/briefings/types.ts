export type BriefingRecommendation = {
    id: string;
    product_id: string | null;
    purchase_id: string | null;
    type: string;
    priority: "high" | "medium" | "low";
    priority_score: number;
    confidence: string;
    title: string;
    recommended_action: string;
    evidence: string[];
    metrics: Record<string, unknown>;
    rule_id: string;
    dismissed_at: string | null;
    resolved_at: string | null;
};

export type InventoryBriefing = {
    id: string;
    briefing_date: string;
    status: string;
    headline: string;
    summary: string[];
    narrator_provider: string;
    narrator_model: string | null;
    generated_at: string;
    recommendations: BriefingRecommendation[];
};

export type BriefingEnvelope = {
    success: boolean;
    briefing: InventoryBriefing | null;
};
