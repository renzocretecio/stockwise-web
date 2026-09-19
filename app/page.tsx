import type { CSSProperties } from "react";
import type { Metadata } from "next";

import { DashboardAssemblyHero } from
    "@/modules/marketing/components/dashboard-assembly-hero";
import { OperationsWorkflowSection } from
    "@/modules/marketing/components/operations-workflow-section";
import { AttentionSection } from
    "@/modules/marketing/components/attention-section";
import { IntelligenceSection } from
    "@/modules/marketing/components/intelligence-section";
import { OfflineSection } from "@/modules/marketing/components/offline-section";
import { PricingSection } from "@/modules/marketing/components/pricing-section";
import { FaqSection } from "@/modules/marketing/components/faq-section";
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

const landingPalette = {
  "--background": "hsl(0 0% 5.8824%)",
  "--foreground": "hsl(0 0% 96.0784%)",
  "--card": "hsl(0 0% 8.6275%)",
  "--card-foreground": "hsl(0 0% 96.0784%)",
  "--popover": "hsl(0 0% 8.6275%)",
  "--popover-foreground": "hsl(0 0% 96.0784%)",
  "--primary": "hsl(45.0679 90.2041% 51.9608%)",
  "--primary-foreground": "hsl(0 0% 12.1569%)",
  "--secondary": "hsl(0 0% 12.9412%)",
  "--secondary-foreground": "hsl(0 0% 92.9412%)",
  "--muted": "hsl(0 0% 12.9412%)",
  "--muted-foreground": "hsl(0 0% 64.7059%)",
  "--accent": "hsl(0 0% 16.0784%)",
  "--accent-foreground": "hsl(45.0679 90.2041% 61%)",
  "--destructive": "hsl(351.7303 72% 52%)",
  "--destructive-foreground": "hsl(0 0% 100%)",
  "--border": "hsl(0 0% 20%)",
} as CSSProperties;

export default function HomePage() {
  return (
    <div
      className={
        "min-h-svh bg-background text-foreground " + "[color-scheme:dark]"
      }
      style={landingPalette}
    >
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
    </div>
  );
}
