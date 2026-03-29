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

// --- Phase 2: Product types ---
export interface ProductImage {
  id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductResource {
  id: number;
  name: string;
  description: string;
  price_vnd: number;
  unit_type: string;
  category_id: number;
  stock_quantity: number;
  is_active: boolean;
  primary_image: { url: string; thumbnail_url: string } | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetailResource {
  id: number;
  name: string;
  description: string;
  price_vnd: number;
  unit_type: string;
  category_id: number;
  category: CategoryResource;
  stock_quantity: number;
  is_active: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface CategoryResource {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  children: CategoryResource[];
  created_at: string;
  updated_at: string;
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

// --- Phase 2: Cart types ---
export interface CartItemResource {
  id: number;
  product_id: number;
  product_name: string;
  product_price_vnd: number;
  quantity: string; // decimal string e.g. "2.000"
  subtotal: number;
  is_available: boolean;
}

export interface CartData {
  id: number;
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
