"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    Plus,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { Purchase, PurchaseStatus } from "@/modules/purchases/types";
import { PurchaseForm } from "@/modules/purchases/components/purchase-form";
import { ReceiveConfirmDialog } from "@/modules/purchases/components/receive-confirm-dialog";
import { OrderConfirmDialog } from "@/modules/purchases/components/order-confirm-dialog";
import { getPurchaseColumns } from "@/modules/purchases/columns/purchases";
import { usePurchases } from "@/modules/purchases/services/purchases";

type TabKey = "all" | "draft" | "ordered" | "received";

const TABS: { key: TabKey; label: string; status: PurchaseStatus | undefined }[] = [
    { key: "all", label: "All", status: undefined },
    { key: "draft", label: "Drafts", status: "draft" },
    { key: "ordered", label: "Awaiting Receipt", status: "ordered" },
    { key: "received", label: "Received", status: "received" },
];

export default function PurchasesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] =
        useState("");

    const [activeTab, setActiveTab] =
        useState<TabKey>("all");

    const [
        selectedPurchase,
        setSelectedPurchase,
    ] = useState<Purchase | null>(null);

    const [
        isPurchaseFormOpen,
        setIsPurchaseFormOpen,
    ] = useState(false);

    const [
        purchaseToReceive,
        setPurchaseToReceive,
    ] = useState<Purchase | null>(null);

    const [
        isReceiveOpen,
        setIsReceiveOpen,
    ] = useState(false);

    const [purchaseToOrder, setPurchaseToOrder] = useState<Purchase | null>(null);

    const debouncedSearch =
        useDebounce(searchQuery, 400);

    const {
        page,
        pageSize,
        setPage,
        setPageSize,
    } = usePagination();

    const currentTab = TABS.find((t) => t.key === activeTab)!;

    const {
        data,
        isLoading,
        isError,
        error,
    } = usePurchases(
        page,
        pageSize,
        currentTab.status,
    );

    const purchases =
        data?.purchases ?? [];

    const pagination =
        data?.pagination;

    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        activeTab,
        setPage,
    ]);

    const columns = getPurchaseColumns({
        onView: (purchase) => {
            router.push(`/purchases/${purchase.id}`);
        },
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

    const handleCreate = () => {
        setSelectedPurchase(null);
        setIsPurchaseFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsPurchaseFormOpen(false);
        setSelectedPurchase(null);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Purchases
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create purchase orders and
                        receive supplier stock.
                    </p>
                </div>

                <Button
                    size="sm"
                    onClick={handleCreate}
                >
                    <Plus className="mr-1 h-4 w-4" />
                    New Purchase
                </Button>
            </div>

            <div className="border-b border-border/80">
                <nav className="flex gap-1 -mb-px" aria-label="Purchase status tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                                activeTab === tab.key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {tab.label}
                            {tab.key === "ordered" &&
                                pagination &&
                                activeTab === "ordered" && (
                                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                        {pagination.total}
                                    </span>
                                )}
                        </button>
                    ))}
                </nav>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(
                                event.target.value,
                            )
                        }
                        placeholder="Search purchases..."
                        className="pl-9"
                    />
                </div>
            </Card>

            {isError && (
                <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load purchases."}
                </Card>
            )}

            {!isError && (
                <>
                    <DataTable
                        columns={columns}
                        data={purchases}
                        getRowId={(purchase) =>
                            purchase.id
                        }
                        isLoading={isLoading}
                    />

                    {pagination && (
                        <Pagination
                            pagination={
                                pagination
                            }
                            onPageChange={
                                setPage
                            }
                            onPageSizeChange={
                                setPageSize
                            }
                            className="mt-4"
                        />
                    )}
                </>
            )}

            <Dialog
                open={isPurchaseFormOpen}
                onOpenChange={(open) => {
                    setIsPurchaseFormOpen(
                        open,
                    );

                    if (!open) {
                        setSelectedPurchase(
                            null,
                        );
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPurchase
                                ? "Update Purchase"
                                : "Create Purchase"}
                        </DialogTitle>

                        <DialogDescription>
                            {selectedPurchase
                                ? "Update this draft purchase."
                                : "Create a new draft purchase order."}
                        </DialogDescription>
                    </DialogHeader>

                    <PurchaseForm
                        key={
                            selectedPurchase?.id ??
                            "new"
                        }
                        purchase={
                            selectedPurchase
                        }
                        onSuccess={
                            handleCloseForm
                        }
                        onCancel={
                            handleCloseForm
                        }
                    />
                </DialogContent>
            </Dialog>

            <ReceiveConfirmDialog
                open={isReceiveOpen}
                onOpenChange={setIsReceiveOpen}
                purchase={purchaseToReceive}
                onSuccess={() => setPurchaseToReceive(null)}
            />

            <OrderConfirmDialog
                open={purchaseToOrder !== null}
                onOpenChange={(open) => {
                    if (!open) setPurchaseToOrder(null);
                }}
                purchase={purchaseToOrder}
                onSuccess={() => setPurchaseToOrder(null)}
            />
        </div>
    );
}
