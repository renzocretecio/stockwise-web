import { AdminAccessBoundary } from
    "@/modules/billing/components/admin-access-boundary";
import { ProtectedAppBootstrap } from
    "@/modules/auth/components/ProtectedAppBootstrap";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedAppBootstrap>
            <main className="min-h-screen bg-muted/20 p-4 sm:p-6">
                <div className="mx-auto max-w-6xl">
                    <p className="mb-4 text-sm font-semibold tracking-tight">
                        StockWise platform administration
                    </p>
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <AdminAccessBoundary>{children}</AdminAccessBoundary>
                    </div>
                </div>
            </main>
        </ProtectedAppBootstrap>
    );
}
