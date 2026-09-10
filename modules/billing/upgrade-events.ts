import type { UpgradeReason } from "@/modules/billing/types";

export const UPGRADE_REQUIRED_EVENT = "stockwise:upgrade-required";

export function requestPlanUpgrade(detail: UpgradeReason = {}) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
        new CustomEvent<UpgradeReason>(UPGRADE_REQUIRED_EVENT, {
            detail,
        }),
    );
}
