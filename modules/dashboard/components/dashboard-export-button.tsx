"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useHasPermission } from
    "@/modules/auth/hooks/use-has-permission";
import { useSession } from "@/modules/auth/services/session";
import {
    auditDashboardPdfExport,
    useDashboard,
} from "@/modules/dashboard/services/dashboard";
import { useSalesReportByDateRange } from
    "@/modules/reports/services/reports";
import type { ReportDateRange } from "@/modules/reports/types";

function downloadPdf(bytes: Uint8Array, filename: string) {
    const copiedBytes = Uint8Array.from(bytes);
    const blob = new Blob([copiedBytes.buffer], {
        type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function errorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to create the PDF.";
}

export function DashboardExportButton({
    dateRange,
}: {
    dateRange: ReportDateRange;
}) {
    const canExport = useHasPermission("reports.export");
    const dashboard = useDashboard();
    const sales = useSalesReportByDateRange(dateRange);
    const session = useSession();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string>();

    if (!canExport) {
        return null;
    }

    const exportPdf = async () => {
        if (!dashboard.data || !sales.data) {
            setError("Dashboard data is not ready yet.");
            return;
        }

        setError(undefined);
        setIsExporting(true);

        try {
            const [renderer, pdfModule] = await Promise.all([
                import("@formepdf/core/browser"),
                import("./overview-pdf-document"),
            ]);
            const activeBusiness = session.data?.active_business;
            const generatedAt = new Intl.DateTimeFormat("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date());
            const pdfDocument = pdfModule.StockWiseOverviewPdfDocument({
                data: {
                    businessName:
                        activeBusiness?.name || "StockWise business",
                    currencyCode:
                        activeBusiness?.currency_code || "PHP",
                    dashboard: dashboard.data,
                    dateRange,
                    generatedAt,
                    sales: sales.data,
                },
            });
            const bytes = await renderer.renderDocument(pdfDocument);

            await auditDashboardPdfExport(dateRange);
            downloadPdf(
                bytes,
                `stockwise-overview-${dateRange.startDate}` +
                    `-to-${dateRange.endDate}.pdf`,
            );
        } catch (exportError) {
            setError(errorMessage(exportError));
        } finally {
            setIsExporting(false);
        }
    };

    const isDataReady = Boolean(dashboard.data && sales.data);

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                disabled={!isDataReady || isExporting}
                onClick={exportPdf}
                size="sm"
                title={error}
                type="button"
                variant="outline"
            >
                {isExporting ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <FileDown className="size-4" />
                )}
                {isExporting ? "Creating PDF" : "Save PDF"}
            </Button>
            {error ? (
                <span
                    className={
                        "max-w-56 text-right text-xs " +
                        "text-destructive"
                    }
                >
                    {error}
                </span>
            ) : null}
        </div>
    );
}
