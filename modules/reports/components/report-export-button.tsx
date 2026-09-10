"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/modules/auth/hooks/use-has-permission";
import type { ReportDateRange } from "@/modules/reports/types";

export type ExportableReport =
    | "sales"
    | "purchases"
    | "inventory"
    | "profit"
    | "low-stock"
    | "stock-movements";

export function ReportExportButton({
    report,
    days,
    dateRange,
}: {
    report: ExportableReport;
    days?: number;
    dateRange?: ReportDateRange;
}) {
    const canExport = useHasPermission("reports.export");
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string>();

    if (!canExport) {
        return null;
    }

    const exportReport = async () => {
        setIsExporting(true);
        setError(undefined);

        try {
            const query = new URLSearchParams();
            if (days) {
                query.set("days", String(days));
            }
            if (dateRange) {
                query.set("start_date", dateRange.startDate);
                query.set("end_date", dateRange.endDate);
            }
            const suffix = query.size ? `?${query.toString()}` : "";
            const response = await fetch(
                `/api/reports/${report}/export${suffix}`,
                {
                    cache: "no-store",
                    credentials: "include",
                },
            );
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(exportErrorMessage(payload));
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = exportFilename(
                response.headers.get("content-disposition"),
                report,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Unable to export this report.",
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2" data-no-print="true">
            {error ? (
                <span
                    className="max-w-48 text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </span>
            ) : null}
            <Button
                disabled={isExporting}
                onClick={() => void exportReport()}
                size="sm"
                type="button"
                variant="outline"
            >
                {isExporting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                ) : (
                    <Download className="size-4" />
                )}
                {isExporting ? "Exporting…" : "Export CSV"}
            </Button>
        </div>
    );
}

function exportFilename(
    disposition: string | null,
    report: ExportableReport,
) {
    const match = disposition?.match(/filename="?([^";]+)"?/i);
    if (match?.[1]) {
        return match[1];
    }

    return `stockwise-${report}.csv`;
}

function exportErrorMessage(payload: unknown) {
    if (!payload || typeof payload !== "object") {
        return "Unable to export this report.";
    }
    const detail = "detail" in payload ? payload.detail : undefined;
    if (typeof detail === "string") {
        return detail;
    }
    if (
        detail &&
        typeof detail === "object" &&
        "message" in detail &&
        typeof detail.message === "string"
    ) {
        return detail.message;
    }

    return "Unable to export this report.";
}
