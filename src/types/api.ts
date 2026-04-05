// Auth API types — per D-02
export interface LoginRequest {
  email: string;
  password: string;
}

// Per D-02: POST /api/auth/login response
export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
}

// Per D-04, D-05: GET /api/me response
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

// Generic API error shape
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// --- Phase 2: Product types (aligned with openapi.yaml) ---
export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface ProductResource {
  id: number;
  name: string;
  price_vnd: number;
  unit_type: string;
  category_id: number;
  stock_quantity: string; // decimal string e.g. "50.000"
  is_active: boolean;
  // Public API returns string URL; Admin API may return object { id, url, is_primary } or null
  primary_image: string | ProductImage | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetailResource {
  id: number;
  name: string;
  description: string | null;
  price_vnd: number;
  unit_type: string;
  stock_quantity: string; // decimal string e.g. "50.000"
  category: { id: number; name: string };
  images: ProductImage[];
}

export interface CategoryResource {
  id: number;
  name: string;
  children?: CategoryResource[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// --- Phase 2: Cart types (aligned with openapi.yaml) ---
export interface CartItemResource {
  id: number;
  product_id: number;
  product_name: string;
  quantity: string; // decimal string e.g. "2.000"
  product_price_vnd: number;
  subtotal: number;
  is_available: boolean;
}

export interface CartData {
  token: string;
  expires_at: string;
  items: CartItemResource[];
  total_amount: number;
}

// --- Phase 2: Checkout types ---
export interface CheckoutPayload {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: 'cod';
}

export interface OrderItemResource {
  id: number;
  product_id: number;
  product_name: string;
  price_vnd: number;
  quantity: string;
  subtotal_vnd: number;
}

export interface OrderResource {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: string;
  order_status_label: string;
  payment_method: string;
  payment_method_label: string;
  payment_status: string;
  payment_status_label: string;
  delivery_method: string | null;
  delivery_method_label: string | null;
  total_amount: string; // string in OrderResource!
  created_by: number | null;
  items: OrderItemResource[];
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  page?: number;
  per_page?: number;
  'filter[category_id]'?: number;
  sort?: string;
}

// --- Phase 3: Admin types ---

// Admin product detail (extends ProductDetailResource with admin fields)
export interface AdminProductDetailResource extends ProductDetailResource {
  category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin image upload/set-primary returns: { id, product_id, url, is_primary }
export interface ProductImageResource {
  id: number;
  product_id?: number;
  url: string;
  is_primary: boolean;
}

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  price_vnd: number;
  unit_type: 'con' | 'kg';
  category_id: number;
  stock_quantity?: string;
  is_active?: boolean;
}

export interface DashboardStats {
  orders_by_status: {
    cho_xac_nhan: number;
    xac_nhan: number;
    dang_giao: number;
    hoan_thanh: number;
    huy: number;
  };
}

export interface StockAdjustmentResource {
  id: number;
  product_id: number;
  admin_user_id: number;
  delta: string;
  adjustment_type: 'nhap_hang' | 'kiem_ke' | 'hu_hong' | 'khac';
  note: string | null;
  stock_before: string;
  stock_after: string;
  created_at: string;
}

export interface AdjustStockPayload {
  delta: number;
  adjustment_type: 'nhap_hang' | 'kiem_ke' | 'hu_hong' | 'khac';
  note?: string;
}

export interface AdminOrderListParams {
  'filter[status]'?: string;
  'filter[search]'?: string;
  'filter[date_from]'?: string;
  'filter[date_to]'?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}
