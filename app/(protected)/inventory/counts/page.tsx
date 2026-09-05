"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardList, Plus, RefreshCw } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getCountColumns } from "@/modules/inventory/columns/counts";
import { StartCountForm } from "@/modules/inventory/components/start-count-form";
import { useInventoryCounts } from "@/modules/inventory/services/counts";
import type { InventoryCountListItem } from "@/modules/inventory/types/counts";

export default function PhysicalCountsPage() {
    const router = useRouter();
    const [isStartFormOpen, setIsStartFormOpen] = useState(false);
    const { data, isLoading, isError, error, refetch, isFetching } =
        useInventoryCounts();
    const counts = data?.counts ?? [];

    const columns = getCountColumns({
        onView: (count: InventoryCountListItem) => {
            router.push(`/inventory/counts/${count.id}`);
        },
    });

    return (
        <div className="pb-12">
            <header
                className={
                    "flex flex-col gap-4 border-b p-4 sm:flex-row " +
                    "sm:items-end sm:justify-between"
                }
            >
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Physical counts
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {counts.length} sessions
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Compare your actual stock with the quantities in
                        Stockwise.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        aria-label="Refresh count sessions"
                        disabled={isFetching}
                        onClick={() => void refetch()}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                isFetching && "animate-spin",
                            )}
                        />
                    </Button>
                    <Button
                        onClick={() => setIsStartFormOpen(true)}
                        size="sm"
                        type="button"
                    >
                        <Plus className="mr-1.5 size-4" />
                        Start count
                    </Button>
                </div>
            </header>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load count sessions
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {error instanceof Error
                                    ? error.message
                                    : "Please try again."}
                            </p>
                        </div>
                        <Button
                            onClick={() => void refetch()}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            Try again
                        </Button>
                    </div>
                </section>
            ) : null}

            <section>
                <div className="p-2 sm:p-4">
                    <DataTable
                        className="rounded-none border-0 shadow-none ring-0"
                        columns={columns}
                        data={counts}
                        emptyLabel="count session"
                        emptyState={
                            <EmptyCounts
                                onStart={() => setIsStartFormOpen(true)}
                            />
                        }
                        getRowId={(count) => count.id}
                        isLoading={isLoading}
                        onRowClick={(count) =>
                            router.push(`/inventory/counts/${count.id}`)
                        }
                    />
                </div>
            </section>

            <Dialog onOpenChange={setIsStartFormOpen} open={isStartFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Start physical count</DialogTitle>
                        <DialogDescription>
                            Choose the products to include in this count
                            session.
                        </DialogDescription>
                    </DialogHeader>
                    <StartCountForm
                        onCancel={() => setIsStartFormOpen(false)}
                        onSuccess={(countId) => {
                            setIsStartFormOpen(false);
                            router.push(`/inventory/counts/${countId}`);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function EmptyCounts({ onStart }: { onStart: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="size-5" />
            </div>
            <p className="font-medium">No count sessions yet</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Start a physical count to reconcile actual stock with the
                system.
            </p>
            <Button className="mt-5" onClick={onStart} size="sm" type="button">
                <Plus className="mr-1.5 size-4" />
                Start count
            </Button>
        </div>
    );
}
