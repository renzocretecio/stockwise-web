import type { Metadata } from "next";

import { DashboardAssemblyHero } from
    "@/modules/marketing/components/dashboard-assembly-hero";
import { OperationsWorkflowSection } from
    "@/modules/marketing/components/operations-workflow-section";
import { AttentionSection } from
    "@/modules/marketing/components/attention-section";
import { IntelligenceSection } from
    "@/modules/marketing/components/intelligence-section";
import { OfflineSection } from
    "@/modules/marketing/components/offline-section";
import { PricingSection } from
    "@/modules/marketing/components/pricing-section";
import { FaqSection } from
    "@/modules/marketing/components/faq-section";
import { FinalCtaSection } from
    "@/modules/marketing/components/final-cta-section";
import { MarketingFooter } from
    "@/modules/marketing/components/marketing-footer";

export const metadata: Metadata = {
    title: "KitaStock - Inventory clarity for small businesses",
    description:
        "Kita ang stock. Kita ang kita. Manage sales, purchases, inventory, " +
        "and reports in one clear workspace.",
};

export default function HomePage() {
    return (
        <>
            <main id="top">
                <DashboardAssemblyHero />
                <OperationsWorkflowSection />
                <AttentionSection />
                <IntelligenceSection />
                <OfflineSection />
                <PricingSection />
                <FaqSection />
                <FinalCtaSection />
            </main>
            <MarketingFooter />
        </>
    );
}
