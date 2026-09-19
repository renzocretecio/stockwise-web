"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Upload,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { referenceDataKeys } from "@/modules/offline/services/reference-data";
import { supplierKeys } from "@/modules/suppliers/services/suppliers";
import type {
    SupplierImportCommitResponse,
    SupplierImportPreviewResponse,
} from "@/modules/suppliers/types/import";

type SupplierImportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (created: number) => void;
};

export function SupplierImportDialog({
    open,
    onOpenChange,
    onSuccess,
}: SupplierImportDialogProps) {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] =
        useState<SupplierImportPreviewResponse | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setIsPreviewing(false);
        setIsImporting(false);
    };

    const changeOpen = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset();
        }
        onOpenChange(nextOpen);
    };

    const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        const extension = selectedFile.name.split(".").pop()?.toLowerCase();

        if (extension !== "csv" && extension !== "xlsx") {
            setError("Choose a CSV or XLSX file.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("Supplier import files must be 5 MB or smaller.");
            return;
        }

        setFile(selectedFile);
        setPreview(null);
        setError(null);
    };

    const previewFile = async () => {
        if (!file) return;

        setIsPreviewing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await apiClient<SupplierImportPreviewResponse>(
                "/api/imports/suppliers/preview",
                {
                    method: "POST",
                    body: formData,
                },
            );
            setPreview(response);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to preview this file.",
            );
        } finally {
            setIsPreviewing(false);
        }
    };

    const importSuppliers = async () => {
        if (!preview) return;

        setIsImporting(true);
        setError(null);

        try {
            const response = await apiClient<SupplierImportCommitResponse>(
                "/api/imports/suppliers/commit",
                {
                    method: "POST",
                    body: JSON.stringify({
                        rows: preview.preview.rows,
                    }),
                },
            );

            if (response.errors.length > 0) {
                setError(response.errors[0].message);
                return;
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: supplierKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: referenceDataKeys.all,
                }),
            ]);
            onSuccess?.(response.created);
            changeOpen(false);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to import suppliers.",
            );
        } finally {
            setIsImporting(false);
        }
    };

    const canImport = Boolean(
        preview &&
            preview.preview.valid_rows > 0 &&
            preview.preview.invalid_rows === 0,
    );

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent
                className={"max-h-[90vh] overflow-y-auto " + "sm:max-w-5xl"}
            >
                <DialogHeader>
                    <DialogTitle>Import suppliers</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or XLSX file. Only the supplier name is
                        required.
                    </DialogDescription>
                </DialogHeader>

                {!preview ? (
                    <div className="space-y-4">
                        <label
                            className={
                                "flex min-h-48 cursor-pointer flex-col " +
                                "items-center justify-center rounded-2xl " +
                                "border-2 border-dashed bg-muted/20 px-6 " +
                                "py-10 text-center transition-colors " +
                                "hover:border-primary/50 hover:bg-muted/40"
                            }
                            htmlFor="supplier-import-file"
                        >
                            <span
                                className={
                                    "mb-4 flex size-12 items-center " +
                                    "justify-center rounded-full " +
                                    "bg-primary/10 text-primary"
                                }
                            >
                                <FileSpreadsheet className="size-6" />
                            </span>
                            <span className="text-sm font-medium">
                                {file ? file.name : "Choose a supplier file"}
                            </span>
                            <span
                                className={
                                    "mt-1 text-xs " + "text-muted-foreground"
                                }
                            >
                                CSV or XLSX, up to 5 MB
                            </span>
                            {file ? (
                                <span
                                    className={
                                        "mt-3 flex items-center gap-2 " +
                                        "text-xs text-muted-foreground"
                                    }
                                >
                                    {(file.size / 1024).toFixed(1)} KB
                                    <button
                                        aria-label="Remove selected file"
                                        className={
                                            "rounded-full p-1 " +
                                            "hover:bg-muted"
                                        }
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setFile(null);
                                        }}
                                        type="button"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </span>
                            ) : null}
                            <input
                                accept=".csv,.xlsx"
                                className="hidden"
                                id="supplier-import-file"
                                onChange={selectFile}
                                type="file"
                            />
                        </label>

                        <FormatGuide />
                        <ErrorMessage message={error} />

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => changeOpen(false)}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!file || isPreviewing}
                                onClick={() => void previewFile()}
                                type="button"
                            >
                                <Upload className="mr-2 size-4" />
                                {isPreviewing ? "Checking..." : "Preview file"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <PreviewSummary preview={preview} />

                        {preview.preview.errors.length > 0 ? (
                            <div
                                className={
                                    "max-h-32 overflow-y-auto " +
                                    "rounded-2xl border " +
                                    "border-destructive/20 " +
                                    "bg-destructive/5 p-3"
                                }
                            >
                                {preview.preview.errors.map((rowError) => (
                                    <p
                                        className="text-xs text-destructive"
                                        key={
                                            `${rowError.row_number}-` +
                                            rowError.message
                                        }
                                    >
                                        Row {rowError.row_number}:{" "}
                                        {rowError.message}
                                    </p>
                                ))}
                            </div>
                        ) : null}

                        <SupplierPreviewTable preview={preview} />
                        <ErrorMessage message={error} />

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={reset}
                                type="button"
                                variant="outline"
                            >
                                Choose another file
                            </Button>
                            <Button
                                disabled={!canImport || isImporting}
                                onClick={() => void importSuppliers()}
                                type="button"
                            >
                                {isImporting
                                    ? "Importing..."
                                    : `Import ${preview.preview.valid_rows} ` +
                                      "suppliers"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function FormatGuide() {
    const downloadTemplate = () => {
        const headers = [
            "name",
            "contact_person",
            "email",
            "phone",
            "address",
            "payment_terms",
            "lead_time_days",
            "notes",
        ].join(",");
        const sample = [
            "North Supply",
            "Ana Reyes",
            "ana@example.com",
            "09170000000",
            "Manila",
            "Net 30",
            "5",
            "Preferred supplier",
        ].join(",");
        const blob = new Blob([`${headers}\n${sample}\n`], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "supplier-import-template.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className={
                "flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 " +
                "sm:flex-row sm:items-center sm:justify-between"
            }
        >
            <div className="text-xs">
                <p className="font-medium">File columns</p>
                <p className="mt-1 text-muted-foreground">
                    Required: name. Optional: contact_person, email, phone,
                    address, payment_terms, lead_time_days, and notes.
                </p>
            </div>
            <Button
                className="self-start sm:self-auto"
                onClick={downloadTemplate}
                size="sm"
                type="button"
                variant="outline"
            >
                <Download className="mr-1.5 size-4" />
                Download template
            </Button>
        </div>
    );
}

function PreviewSummary({
    preview,
}: {
    preview: SupplierImportPreviewResponse;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">{preview.filename}</p>
                    <p className="text-xs text-muted-foreground">
                        Check the rows before adding them to your business.
                    </p>
                </div>
                {preview.preview.invalid_rows === 0 ? (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                ) : (
                    <AlertTriangle
                        className="size-5 shrink-0 text-destructive"
                    />
                )}
            </div>
            <div
                className={
                    "grid grid-cols-3 gap-px overflow-hidden " +
                    "rounded-2xl bg-border"
                }
            >
                <SummaryValue label="Rows" value={preview.preview.total_rows} />
                <SummaryValue
                    label="Ready"
                    value={preview.preview.valid_rows}
                />
                <SummaryValue
                    label="Needs fixing"
                    value={preview.preview.invalid_rows}
                />
            </div>
        </div>
    );
}

function SummaryValue({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-card p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
    );
}

function SupplierPreviewTable({
    preview,
}: {
    preview: SupplierImportPreviewResponse;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium">
                                Row
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                                Supplier
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                                Contact
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                                Email
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                                Phone
                            </th>
                            <th
                                className={
                                    "whitespace-nowrap px-3 py-2 " +
                                    "text-right font-medium"
                                }
                            >
                                Lead time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {preview.preview.rows.map((row) => (
                            <tr key={row.row_number}>
                                <td
                                    className={
                                        "px-3 py-2 " + "text-muted-foreground"
                                    }
                                >
                                    {row.row_number}
                                </td>
                                <td className="px-3 py-2 font-medium">
                                    {row.name}
                                </td>
                                <td className="px-3 py-2">
                                    {row.contact_person || "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.email || "—"}
                                </td>
                                <td className="px-3 py-2">
                                    {row.phone || "—"}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {row.lead_time_days} days
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ErrorMessage({ message }: { message: string | null }) {
    if (!message) return null;

    return (
        <div
            className={
                "flex items-center gap-2 rounded-2xl border " +
                "border-destructive/30 bg-destructive/5 p-3 " +
                "text-sm text-destructive"
            }
        >
            <AlertTriangle className="size-4 shrink-0" />
            {message}
        </div>
    );
}
