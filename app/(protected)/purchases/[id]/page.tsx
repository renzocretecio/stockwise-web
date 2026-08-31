"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  PackageCheck,
  Send,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCancelPurchase,
  usePurchase,
  useReceivePurchase,
} from "@/modules/purchases/services/purchases";
import { OrderConfirmDialog } from "@/modules/purchases/components/order-confirm-dialog";

export default function PurchaseDetailPage() {
  const params = useParams<{ id: string }>();

  const router = useRouter();

  const purchaseId = params.id;

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data, isLoading, isError, error } = usePurchase(purchaseId);

  const {
    mutateAsync: receivePurchase,
    isPending: isReceiving,
    error: receiveError,
  } = useReceivePurchase(purchaseId);

  const { mutateAsync: cancelPurchase, isPending: isCancelling } =
    useCancelPurchase(purchaseId);

  const purchase = data;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-muted/60"
          />
        ))}
      </div>
    );
  }

  if (isError || !purchase) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 p-6 text-destructive">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />

          {error instanceof Error ? error.message : "Failed to load purchase."}
        </div>
      </Card>
    );
  }

  const canOrder = purchase.status === "draft";
  const canReceive = purchase.status === "ordered";

  const canCancel = purchase.status === "draft";

  const handleReceive = async () => {
    try {
      await receivePurchase();
      setIsReceiveOpen(false);
    } catch {
      // Error shown in dialog.
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPurchase();
      setIsCancelOpen(false);
    } catch {
      // Mutation handles error.
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <button
          type="button"
          onClick={() => router.push("/purchases")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to purchases
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {purchase.reference_number || "Purchase"}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {purchase.supplier_name}
            </p>
          </div>

          <div className="flex gap-2">
            {canCancel && (
              <Button variant="outline" onClick={() => setIsCancelOpen(true)}>
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}

            {canReceive && (
              <Button onClick={() => setIsReceiveOpen(true)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Receive
              </Button>
            )}

            {canOrder && (
              <Button onClick={() => setIsOrderOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Place order
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>

              <th className="px-4 py-3 text-right">Qty</th>

              <th className="px-4 py-3 text-right">Unit Cost</th>

              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {purchase.items.map((item) => (
              <tr key={item.id ?? item.product_id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.product_name}</div>

                  {item.sku && (
                    <div className="text-xs text-muted-foreground">
                      {item.sku}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-right">{item.quantity}</td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(item.unit_cost)}
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(item.quantity * item.unit_cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="ml-auto max-w-md p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(purchase.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(purchase.tax_amount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <span>{formatCurrency(-purchase.discount_amount)}</span>
          </div>

          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(purchase.total_amount)}</span>
          </div>
        </div>
      </Card>

      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Purchase</DialogTitle>

            <DialogDescription>
              Receiving this purchase will increase the stock quantity of all
              items in this purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700">
            This action mutates inventory stock and should only be done once the
            supplier delivery has been physically received.
          </div>

          {receiveError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {receiveError instanceof Error
                ? receiveError.message
                : "Failed to receive purchase."}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReceiveOpen(false)}
              disabled={isReceiving}
            >
              Cancel
            </Button>

            <Button onClick={handleReceive} disabled={isReceiving}>
              {isReceiving ? "Receiving..." : "Receive Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderConfirmDialog
        open={isOrderOpen}
        onOpenChange={setIsOrderOpen}
        purchase={purchase}
      />

      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Purchase?</DialogTitle>

            <DialogDescription>
              This purchase will be marked as cancelled and can no longer be
              received.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
              disabled={isCancelling}
            >
              Keep Purchase
            </Button>

            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
