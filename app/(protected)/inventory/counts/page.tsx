"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, AlertTriangle, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/DataTable";
import {
    useInventoryCounts
} from "@/modules/inventory/services/counts";
import { getCountColumns } from "@/modules/inventory/columns/counts";
import { StartCountForm } from "@/modules/inventory/components/start-count-form";
import { InventoryCountListItem } from "@/modules/inventory/types/counts";

export default function PhysicalCountsPage() {
    const router = useRouter();
    const [isStartFormOpen, setIsStartFormOpen] = useState(false);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useInventoryCounts();

    const counts = data?.counts ?? [];
    const errorMessage =
        error instanceof Error ? error.message : "Failed to load count sessions";

    const columns = getCountColumns({
        onView: (count: InventoryCountListItem) => {
            router.push(`/inventory/counts/${count.id}`);
        },
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Physical Counts
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {counts.length}{" "}
                            {counts.length === 1 ? "session" : "sessions"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Reconcile actual stock counts against expected quantities.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="cursor-pointer gap-1.5"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                        onClick={() => setIsStartFormOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Start Count</span>
                    </Button>
                </div>
            </div>

            {isError && (
                <Card className="p-6 border-destructive/50 bg-destructive/5 text-destructive">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                                Failed to load count sessions
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {errorMessage}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="cursor-pointer"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {!isError && counts.length === 0 && !isLoading && (
                <Card className="p-12 text-center border-dashed border-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        No count sessions yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
                        Start a physical count to reconcile your actual stock against
                        the system.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => setIsStartFormOpen(true)}
                        className="cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Start Count</span>
                    </Button>
                </Card>
            )}

            {!isError && (counts.length > 0 || isLoading) && (
                <DataTable
                    columns={columns}
                    data={counts}
                    getRowId={(c) => c.id}
                    isLoading={isLoading}
                    emptyLabel="count session"
                    onRowClick={(c) => router.push(`/inventory/counts/${c.id}`)}
                />
            )}

            <Dialog open={isStartFormOpen} onOpenChange={setIsStartFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Start Physical Count</DialogTitle>
                        <DialogDescription>
                            Choose which products to include in this count session.
                        </DialogDescription>
                    </DialogHeader>

                    <StartCountForm
                        onSuccess={(countId) => {
                            setIsStartFormOpen(false);
                            router.push(`/inventory/counts/${countId}`);
                        }}
                        onCancel={() => setIsStartFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}