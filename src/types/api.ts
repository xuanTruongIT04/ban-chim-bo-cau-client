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
