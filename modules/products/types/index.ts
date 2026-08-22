export interface Product {
  id: string;
  business_id?: string;
  name: string;
  sku?: string;
  supplier_id?: string;
  supplier_name?: string; 
  barcode?: string;
  description?: string;
  category?: string;
  category_name?: string;
  category_id?: string;
  price?: number;
  cost_price?: number;
  selling_price?: number;
  brand?: string;
  quantity?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  reorder_point?: number;
  unit?: string;
  is_active: boolean;
  lead_time_days: number;
  safety_stock: number;
  is_perishable: boolean;
  margin_percent: number;
  created_at?: string;
  updated_at?: string;
  stock_status: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: PaginationMeta;
}

export interface OverallStatusResponse {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}