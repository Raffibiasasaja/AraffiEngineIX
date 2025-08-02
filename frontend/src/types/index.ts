/**
 * TypeScript Type Definitions for Bakso Kangen
 */

// User types
export interface User {
  id: string;
  username: string;
  role: 'customer' | 'admin' | 'owner';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role?: 'customer' | 'admin' | 'owner';
}

// Menu types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  available?: boolean;
}

// Order types
export type OrderStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Order {
  id: string;
  tableNumber: string;
  menu: string;
  note: string;
  status: OrderStatus;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormData {
  tableNumber: string;
  menu: string;
  note?: string;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  note?: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    name: string;
    message: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  orders: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Analytics types
export interface DailyStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  activeTableCount: number;
}

export interface PopularItem {
  menu: string;
  count: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  uniqueTables: number;
  dailyBreakdown: Record<string, {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  }>;
  menuStats: Record<string, {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  }>;
  hourlyDistribution: number[];
}

// UI Component types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

// Query and Filter types
export interface OrderFilters {
  status?: OrderStatus;
  tableNumber?: string;
  menu?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'tableNumber' | 'menu' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface MenuFilters {
  available?: boolean;
  search?: string;
}

// Local Storage types
export interface LocalStorageKeys {
  AUTH_TOKEN: string;
  USER_DATA: string;
  THEME_MODE: string;
  ORDER_DRAFT: string;
}

// Error types
export interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Route types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requireAuth?: boolean;
  allowedRoles?: User['role'][];
  title?: string;
}

// Hook return types
export interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
}

// Event types
export interface OrderEvent {
  type: 'order_created' | 'order_updated' | 'order_deleted';
  order: Order;
}

export interface MenuEvent {
  type: 'menu_created' | 'menu_updated' | 'menu_deleted';
  menuItem: MenuItem;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;