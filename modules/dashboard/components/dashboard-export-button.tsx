"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import { useSession } from "@/modules/auth/services/session";
import { auditDashboardPdfExport } from "@/modules/dashboard/services/dashboard";
import type { SalesReport } from "@/modules/reports/types";
import type { DashboardData } from "@/modules/dashboard/types";
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
    sales,
    dashboard,
}: {
    dateRange: ReportDateRange;
    sales?: SalesReport;
    dashboard?: DashboardData;
}) {
    const canExport = useHasPermission("reports.export");
    const session = useSession();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string>();

    if (!canExport) {
        return null;
    }

    const exportPdf = async () => {
        if (!dashboard || !sales) {
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
                    businessName: activeBusiness?.name || "StockWise business",
                    currencyCode: activeBusiness?.currency_code || "PHP",
                    dashboard: dashboard,
                    dateRange,
                    generatedAt,
                    sales: sales,
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

    const isDataReady = Boolean(dashboard && sales);

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                aria-label={isExporting ? "Creating PDF" : "Save PDF"}
                className="size-10 p-0 sm:h-9 sm:w-auto sm:px-3"
                disabled={!isDataReady || isExporting}
                onClick={exportPdf}
                size="sm"
                title={error}
                type="button"
                variant="default"
            >
                {isExporting ? (
                    <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin"
                    />
                ) : (
                    <FileDown aria-hidden="true" className="size-4" />
                )}
                <span className="hidden sm:inline">
                    {isExporting ? "Creating PDF" : "Save PDF"}
                </span>
            </Button>
            {error ? (
                <span
                    className={
                        "max-w-56 text-right text-xs " + "text-destructive"
                    }
                >
                    {error}
                </span>
            ) : null}
        </div>
    );
}
