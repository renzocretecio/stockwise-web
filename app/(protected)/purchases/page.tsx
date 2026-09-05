"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackagePlus, Plus, RefreshCw, Search } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { getPurchaseColumns } from "@/modules/purchases/columns/purchases";
import { OrderConfirmDialog } from "@/modules/purchases/components/order-confirm-dialog";
import { PurchaseForm } from "@/modules/purchases/components/purchase-form";
import { ReceiveConfirmDialog } from "@/modules/purchases/components/receive-confirm-dialog";
import { usePurchases } from "@/modules/purchases/services/purchases";
import type { Purchase, PurchaseStatus } from "@/modules/purchases/types";

type TabKey = "all" | "draft" | "ordered" | "received";

const tabs: { key: TabKey; label: string; status?: PurchaseStatus }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts", status: "draft" },
    { key: "ordered", label: "Awaiting receipt", status: "ordered" },
    { key: "received", label: "Received", status: "received" },
];

export default function PurchasesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reorderDraft = useMemo(
        () => getReorderDraft(searchParams),
        [searchParams],
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
        null,
    );
    const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(
        () => reorderDraft !== null,
    );
    const [purchaseToReceive, setPurchaseToReceive] = useState<Purchase | null>(
        null,
    );
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);
    const [purchaseToOrder, setPurchaseToOrder] = useState<Purchase | null>(
        null,
    );
    const debouncedSearch = useDebounce(searchQuery, 400);
    const { page, pageSize, setPage, setPageSize } = usePagination();
    const currentTab = tabs.find((tab) => tab.key === activeTab);
    const { data, isLoading, isError, error, refetch, isFetching } =
        usePurchases(
            page,
            pageSize,
            currentTab?.status,
            undefined,
            debouncedSearch,
        );

    const purchases = data?.purchases ?? [];
    const pagination = data?.pagination;

    const columns = getPurchaseColumns({
        onView: (purchase) => router.push(`/purchases/${purchase.id}`),
        onEdit: (purchase) => {
            setSelectedPurchase(purchase);
            setIsPurchaseFormOpen(true);
        },
        onOrder: setPurchaseToOrder,
        onReceive: (purchase) => {
            setPurchaseToReceive(purchase);
            setIsReceiveOpen(true);
        },
    });

    const closeForm = () => {
        setIsPurchaseFormOpen(false);
        setSelectedPurchase(null);
        if (reorderDraft) router.replace("/purchases");
    };

    const selectTab = (tab: TabKey) => {
        setActiveTab(tab);
        setPage(1);
    };

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
                            Purchases
                        </h1>
                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? purchases.length} orders
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Create purchase orders and receive stock from suppliers.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        aria-label="Refresh purchases"
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
                        onClick={() => setIsPurchaseFormOpen(true)}
                        size="sm"
                    >
                        <Plus className="mr-1.5 size-4" />
                        New purchase
                    </Button>
                </div>
            </header>

            <section className="border-b">
                <nav
                    aria-label="Purchase status"
                    className="flex overflow-x-auto px-4"
                >
                    {tabs.map((tab) => (
                        <button
                            className={cn(
                                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium " +
                                    "transition-colors",
                                activeTab === tab.key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground " +
                                          "hover:text-foreground",
                            )}
                            key={tab.key}
                            onClick={() => selectTab(tab.key)}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </section>

            <section className="border-b">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search
                            aria-hidden="true"
                            className={
                                "absolute left-3 top-1/2 size-4 -translate-y-1/2 " +
                                "text-muted-foreground"
                            }
                        />
                        <Input
                            aria-label="Search purchases"
                            className="h-10 pl-9"
                            onChange={(event) => {
                                setPage(1);
                                setSearchQuery(event.target.value);
                            }}
                            placeholder="Search a purchase or supplier"
                            value={searchQuery}
                        />
                    </div>
                    {searchQuery ? (
                        <Button
                            onClick={() => {
                                setPage(1);
                                setSearchQuery("");
                            }}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            Clear search
                        </Button>
                    ) : null}
                </div>
            </section>

            {isError ? (
                <section className="border-b bg-destructive/5 p-5">
                    <div className="flex items-start gap-3 text-sm text-destructive">
                        <PackagePlus className="mt-0.5 size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Unable to load purchases
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

            <div className="p-2 sm:p-4">
                <DataTable
                    className="rounded-none border-0 shadow-none ring-0"
                    columns={columns}
                    data={purchases}
                    emptyLabel="purchase"
                    emptyState={
                        <EmptyPurchases
                            filtered={
                                Boolean(searchQuery) || activeTab !== "all"
                            }
                            onCreate={() => setIsPurchaseFormOpen(true)}
                        />
                    }
                    getRowId={(purchase) => purchase.id}
                    isLoading={isLoading}
                />
                {pagination ? (
                    <Pagination
                        className="mt-4"
                        isLoading={isFetching}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        pagination={pagination}
                    />
                ) : null}
            </div>

            <Dialog
                onOpenChange={(open) => {
                    setIsPurchaseFormOpen(open);
                    if (!open) closeForm();
                }}
                open={isPurchaseFormOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPurchase
                                ? "Update purchase"
                                : "New purchase"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPurchase
                                ? "Update this draft purchase order."
                                : "Create a purchase order before receiving stock."}
                        </DialogDescription>
                    </DialogHeader>
                    <PurchaseForm
                        initialData={
                            selectedPurchase ? undefined : reorderDraft ?? undefined
                        }
                        key={selectedPurchase?.id ?? reorderDraft?.product_id ?? "new"}
                        onCancel={closeForm}
                        onSuccess={closeForm}
                        purchase={selectedPurchase}
                    />
                </DialogContent>
            </Dialog>

            <ReceiveConfirmDialog
                onOpenChange={setIsReceiveOpen}
                onSuccess={() => setPurchaseToReceive(null)}
                open={isReceiveOpen}
                purchase={purchaseToReceive}
            />

            <OrderConfirmDialog
                onOpenChange={(open) => {
                    if (!open) setPurchaseToOrder(null);
                }}
                onSuccess={() => setPurchaseToOrder(null)}
                open={purchaseToOrder !== null}
                purchase={purchaseToOrder}
            />
        </div>
    );
}

function getReorderDraft(searchParams: URLSearchParams) {
    const productId = searchParams.get("product_id");
    const supplierId = searchParams.get("supplier_id");
    const quantity = Number(searchParams.get("quantity"));
    const unitCost = Number(searchParams.get("unit_cost"));
    const expectedDeliveryDate = searchParams.get("expected_delivery_date");

    if (
        !productId ||
        !supplierId ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
    ) {
        return null;
    }

    return {
        product_id: productId,
        supplier_id: supplierId,
        expected_delivery_date: expectedDeliveryDate || null,
        items: [
            {
                product_id: productId,
                quantity,
                unit_cost: unitCost,
            },
        ],
        notes: "Draft prepared by Reorder Assistant. Review before ordering.",
    };
}

function EmptyPurchases({
    filtered,
    onCreate,
}: {
    filtered: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PackagePlus className="size-5" />
            </div>
            <p className="font-medium">
                {filtered ? "No matching purchases" : "No purchases yet"}
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {filtered
                    ? "Try another search or select a different status."
                    : "Create a purchase order to keep incoming stock organized."}
            </p>
            {!filtered ? (
                <Button
                    className="mt-5"
                    onClick={onCreate}
                    size="sm"
                    type="button"
                >
                    <Plus className="mr-1.5 size-4" />
                    New purchase
                </Button>
            ) : null}
        </div>
    );
}
