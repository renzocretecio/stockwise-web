"use client";

import { useState } from "react";
import { Pencil, PackagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/modules/products/components/product-form";
import {
  MasterDetailConsole,
  type MasterDetailAction,
} from "@/components/MasterDetailConsole";
import { Product } from "../types";
/**
 * Products console — wired to the actual ProductService response shape.
 */


export function ProductsConsole({ products }: { products: Product[] }) {
    const [isProductEditOpen, setIsProductEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    return (
        <div>
            <MasterDetailConsole<Product>
                title="Products"
                counterLabel={`${products.length} total`}
                items={products}
                getId={(p) => p.id}
                getTitle={(p) => p.name}
                getSubtitle={(p) => p.sku ?? p.category_name ?? "No SKU"}
                getStatus={(p) => {
                if (!p.is_active) return { label: "Inactive", tone: "neutral" };
                    switch (p?.stock_status) {
                        case "out_of_stock":
                            return { label: "Out of stock", tone: "danger" };
                        case "low_stock":
                            return { label: "Low stock", tone: "warning" };
                        default:
                            return { label: "In stock", tone: "success" };
                    }
                }}
                searchPlaceholder="Search products"
                searchPredicate={(p, q) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.sku?.toLowerCase().includes(q) ?? false) ||
                    (p.barcode?.toLowerCase().includes(q) ?? false) ||
                    (p.category_name?.toLowerCase().includes(q) ?? false)
                }
                getDetailId={(p) => p.sku ?? p.id.slice(0, 8)}
                getInfoFields={(p) => [
                    { label: "Category", value: p.category_name ?? "Uncategorized" },
                    { label: "Supplier", value: p.supplier_name ?? "—" },
                    { label: "Brand", value: p.brand ?? "—" },
                    { label: "Unit", value: p.unit },
                    { label: "Cost price", value: p?.cost_price ? `$${p.cost_price.toFixed(2)}` : 0},
                    { label: "Selling price", value: p?.selling_price ? `$${p.selling_price.toFixed(2)}` : 0},
                    { label: "Margin", value: `${p.margin_percent.toFixed(1)}%` },
                    { label: "Barcode", value: p.barcode ?? "—" },
                    { label: "Reorder point", value: String(p.reorder_point) },
                    { label: "Safety stock", value: String(p.safety_stock) },
                    { label: "Lead time", value: `${p.lead_time_days} days` },
                    { label: "Perishable", value: p.is_perishable ? "Yes" : "No" },
                ]}
                getDescription={(p) => p.description}
                getActivity={(p) => [
                    ...(p.created_at
                    ? [
                        {
                            title: "Product created",
                            time: new Date(p.created_at).toLocaleString(),
                        },
                        ]
                    : []),
                    ...(p.updated_at && p.updated_at !== p.created_at
                    ? [
                        {
                            title: "Last updated",
                            time: new Date(p.updated_at).toLocaleString(),
                        },
                        ]
                    : []),
                ]}
                getActions={(p): MasterDetailAction[] => [
                    {
                        label: "Adjust stock",
                        icon: <PackagePlus className="h-4 w-4" />,
                        onClick: () => console.log("adjust stock", p.id),
                    },
                    {
                        label: "Edit product",
                        variant: "primary",
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => {
                            setSelectedProduct(p);
                            setIsProductEditOpen(true);
                        },
                    },
                ]}
                emptyLabel="product"
            />

            <Dialog
                    open={isProductEditOpen}
                    onOpenChange={setIsProductEditOpen}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Update product
                            </DialogTitle>

                            <DialogDescription>
                                Update the details of this product in your inventory catalog.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedProduct && (
                            <ProductForm
                                productId={selectedProduct.id}
                                initialData={selectedProduct}
                                onSuccess={() => {
                                    setIsProductEditOpen(false);
                                }}
                                onCancel={() => {
                                    setIsProductEditOpen(false);
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
        </div>
        
    );
}