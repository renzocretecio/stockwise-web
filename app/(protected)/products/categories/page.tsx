"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Plus, RefreshCw } from "lucide-react";

import { useCategories } from "@/modules/products/categories/services";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function CategoriesPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        setBusinessId(Cookies.get("active_business_id"));
        setIsMounted(true);
    }, []);

    const {
        data: categories = [],
        isLoading: isCategoriesLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useCategories(businessId || "");

    const errorMessage =
        error instanceof Error
        ? error.message
        : "Failed to load categories";

    if (!isMounted) {
        return <CategoriesTableSkeleton />;
    }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Categories
          </h1>

          <p className="text-sm text-muted-foreground">
            Organize your products into categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={
                isFetching
                  ? "mr-2 size-4 animate-spin"
                  : "mr-2 size-4"
              }
            />
            Refresh
          </Button>

          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add category
          </Button>
        </div>
      </div>

      {!businessId && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Select a business to view categories.
            </p>
          </CardContent>
        </Card>
      )}

      {businessId && isCategoriesLoading && (
        <CategoriesTableSkeleton />
      )}

      {businessId && isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div>
              <h2 className="font-medium">
                Unable to load categories
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {businessId &&
        !isCategoriesLoading &&
        !isError && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Product categories
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {Array.isArray(categories) ? categories.length : 0}{" "}
                  {(Array.isArray(categories) ? categories.length : 0) === 1
                    ? "category"
                    : "categories"}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {!Array.isArray(categories) || categories.length === 0 ? (
                <EmptyCategories />
              ) : (
                <CategoriesTable
                  categories={categories}
                />
              )}
            </CardContent>
          </Card>
        )}
    </main>
  );
}

type Category = {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

function CategoriesTable({
  categories,
}: {
  categories: Category[];
}) {
    const safeCategories = Array.isArray(categories) ? categories : [];
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {safeCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">
                {category.name}
              </TableCell>

              <TableCell className="max-w-md truncate text-muted-foreground">
                {category.description || "—"}
              </TableCell>

              <TableCell>
                <StatusBadge
                  isActive={
                    category.is_active ?? true
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function EmptyCategories() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <h2 className="font-medium">
        No categories yet
      </h2>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first category to organize
        products more easily.
      </p>

      <Button className="mt-4" size="sm">
        <Plus className="mr-2 size-4" />
        Add category
      </Button>
    </div>
  );
}

function CategoriesTableSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-md bg-muted"
            />
          ),
        )}
      </CardContent>
    </Card>
  );
}