import { Header } from "@/modules/layout/components/Header";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SyncStatus } from "@/components/SyncStatus";
import { OfflineSync } from "@/components/OfflineSync";
import { OfflineAccessBoundary } from "@/components/OfflineAccessBoundary";
import { UpgradeDialog } from "@/modules/billing/components/upgrade-dialog";
import { UpgradePaymentToast } from "@/modules/billing/components/upgrade-payment-toast";
import { TrialExpiryWarning } from "@/modules/billing/components/trial-expiry-warning";
import { ProtectedAccessBoundary } from "@/modules/auth/components/ProtectedAccessBoundary";
import { ProtectedAppBootstrap } from "@/modules/auth/components/ProtectedAppBootstrap";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedAppBootstrap>
      <div className="flex min-h-screen flex-col">
        <Header />
        <TrialExpiryWarning />
        <ConnectionStatus />
        <OfflineSync />
        <SyncStatus />
        <main className="w-full flex-1 overflow-auto p-4">
            <ProtectedAccessBoundary>
              <OfflineAccessBoundary>{children}</OfflineAccessBoundary>
            </ProtectedAccessBoundary>
        </main>
        <UpgradePaymentToast />
        <UpgradeDialog />
      </div>
    </ProtectedAppBootstrap>
  );
}
