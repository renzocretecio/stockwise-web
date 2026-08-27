"use client";

import { useState } from "react";
import {
    FileSpreadsheet,
    Upload,
    CheckCircle2,
    AlertTriangle,
    X,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ImportProductRow, ImportPreview, ImportPreviewResponse } from "../types/import";

type ProductImportDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function ProductImportDialog({
    open,
    onOpenChange,
    onSuccess,
}: ProductImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] =
        useState<ImportPreviewResponse | null>(null);

    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const extension = selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (extension !== "csv" && extension !== "xlsx") {
            setError("Please upload a CSV or XLSX file.");
            return;
        }

        setFile(selectedFile);
        setPreview(null);
        setError(null);
    };

    const handlePreview = async () => {
        if (!file) {
            return;
        }

        setIsPreviewing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await apiClient<ImportPreviewResponse>(
                "/api/imports/products/preview",
                {
                    method: "POST",
                    body: formData,
                },
            );

            setPreview(response);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to preview the file.",
            );
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleImport = async () => {
        if (!preview) {
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            await apiClient("/api/imports/products/commit", {
                method: "POST",
                body: JSON.stringify({rows: preview.preview.rows}),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            onOpenChange(false);
            onSuccess?.();
            handleReset();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to import products.",
            );
        } finally {
            setIsImporting(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setIsPreviewing(false);
        setIsImporting(false);
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            handleReset();
        }

        onOpenChange(open);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        Import Products
                    </DialogTitle>

                    <DialogDescription>
                        Upload a CSV or XLSX file to import products
                        into your inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {!preview && (
                        <div className="space-y-4">
                            <label
                                htmlFor="product-import-file"
                                className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
                            >
                                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <FileSpreadsheet className="size-6" />
                                </div>

                                <p className="text-sm font-medium">
                                    {file
                                        ? file.name
                                        : "Click to upload your product file"}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    CSV or XLSX files only
                                </p>

                                {file && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setFile(null);
                                            }}
                                            className="rounded-md p-1 hover:bg-muted"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    id="product-import-file"
                                    type="file"
                                    accept=".csv,.xlsx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    disabled={!file || isPreviewing}
                                    onClick={handlePreview}
                                >
                                    <Upload className="mr-2 size-4" />

                                    {isPreviewing
                                        ? "Checking..."
                                        : "Preview File"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {preview && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        {preview.filename}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Review the products before importing.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                >
                                    Choose another file
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-card p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Total rows
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold">
                                        {preview.preview.total_rows}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        Valid rows
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                                        {preview.preview.valid_rows}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                    <p className="text-xs text-destructive">
                                        Invalid rows
                                    </p>

                                    <p className="mt-1 text-2xl font-semibold text-destructive">
                                        {preview.preview.invalid_rows}
                                    </p>
                                </div>
                            </div>

                            {preview.preview.invalid_rows > 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
                                    <AlertTriangle className="size-4 shrink-0" />

                                    Some rows contain errors. Please fix
                                    them before importing.
                                </div>
                            )}

                            {preview.preview.invalid_rows === 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-400">
                                    <CheckCircle2 className="size-4 shrink-0" />

                                    All {preview.preview.valid_rows} rows
                                    are valid and ready to import.
                                </div>
                            )}

                            <div className="overflow-hidden rounded-lg border">
                                <div className="max-h-[400px] overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-muted">
                                            <tr>
                                                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                                                    Row
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                                                    SKU
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                                                    Name
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                                                    Category
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                                                    Cost
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                                                    Selling Price
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                                                    Reorder
                                                </th>
                                                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                                                    Supplier
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y">
                                            {preview.preview.rows.map(
                                                (row) => (
                                                    <tr
                                                        key={row.row_number}
                                                        className="hover:bg-muted/40"
                                                    >
                                                        <td className="px-3 py-2 text-muted-foreground">
                                                            {row.row_number}
                                                        </td>

                                                        <td className="px-3 py-2 font-mono text-xs">
                                                            {row.sku}
                                                        </td>

                                                        <td className="px-3 py-2 font-medium">
                                                            {row.name}
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            {row.category}
                                                        </td>

                                                        <td className="px-3 py-2 text-right">
                                                            {row.cost_price.toFixed(
                                                                2,
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-2 text-right">
                                                            {row.selling_price.toFixed(
                                                                2,
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-2 text-right">
                                                            {row.reorder_point}
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            {row.supplier_name}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    disabled={
                                        preview.preview.invalid_rows > 0 ||
                                        isImporting
                                    }
                                    onClick={handleImport}
                                >
                                    {isImporting
                                        ? "Importing..."
                                        : `Import ${preview.preview.valid_rows} Products`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}