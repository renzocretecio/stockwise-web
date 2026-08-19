export type Category = {
    id: string;
    name: string;
    description: string | null;
    product_count: number;
    is_active: boolean;
    created_at: string;
};

export type CreateCategoryRequest = {
    name: string;
    description?: string;
};