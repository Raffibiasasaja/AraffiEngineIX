/**
 * Application Constants and Configuration
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    USERS: '/auth/users',
  },
  
  // Menu
  MENU: {
    BASE: '/menu',
    AVAILABLE: '/menu/available',
    SEARCH: '/menu/search',
    STATS: '/menu/stats',
    BULK: '/menu/bulk',
    TOGGLE: (id: string) => `/menu/${id}/toggle`,
    BY_ID: (id: string) => `/menu/${id}`,
  },
  
  // Orders
  ORDERS: {
    BASE: '/orders',
    PENDING: '/orders/pending',
    IN_PROGRESS: '/orders/in-progress',
    COMPLETED: '/orders/completed',
    EXPORT_CSV: '/orders/export/csv',
    ANALYTICS: '/orders/analytics',
    STATS: {
      DAILY: '/orders/stats/daily',
      POPULAR: '/orders/stats/popular',
    },
    BY_ID: (id: string) => `/orders/${id}`,
    BY_TABLE: (tableNumber: string) => `/orders/table/${tableNumber}`,
    ACCEPT: (id: string) => `/orders/${id}/accept`,
    COMPLETE: (id: string) => `/orders/${id}/complete`,
    BULK: {
      STATUS: '/orders/bulk/status',
      DELETE: '/orders/bulk',
    },
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'bakso_kangen_token',
  USER_DATA: 'bakso_kangen_user',
  THEME_MODE: 'bakso_kangen_theme',
  ORDER_DRAFT: 'bakso_kangen_order_draft',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  OWNER: '/owner',
  NOT_FOUND: '/404',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.IN_PROGRESS]: 'blue',
  [ORDER_STATUS.COMPLETED]: 'success',
} as const;

// Currency Formatting
export const CURRENCY = {
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
  CURRENCY_CODE: 'IDR',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Theme Configuration
export const THEME = {
  MODES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  STORAGE_KEY: STORAGE_KEYS.THEME_MODE,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  TABLE_NUMBER: {
    PATTERN: /^[1-9]\d*$/,
  },
  MENU_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  NOTE: {
    MAX_LENGTH: 500,
  },
  PRICE: {
    MIN: 0,
    MAX: 1000000,
  },
} as const;

// Toast Configuration
export const TOAST = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
  },
  POSITION: 'top-right',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  ORDER_DELETED: 'Order deleted successfully!',
  MENU_CREATED: 'Menu item created successfully!',
  MENU_UPDATED: 'Menu item updated successfully!',
  MENU_DELETED: 'Menu item deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

// Time Intervals
export const INTERVALS = {
  POLLING: 30000, // 30 seconds
  REFETCH: 60000, // 1 minute
  SESSION_CHECK: 300000, // 5 minutes
} as const;

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: true,
  EXPORT: true,
  BULK_OPERATIONS: true,
  REAL_TIME_UPDATES: false, // WebSocket updates
} as const;

// Menu Categories (if needed for future expansion)
export const MENU_CATEGORIES = {
  BAKSO: 'Bakso',
  NOODLES: 'Noodles',
  DRINKS: 'Drinks',
  SIDES: 'Sides',
} as const;

// Export types for constants
export type ApiEndpoint = typeof API_ENDPOINTS;
export type StorageKey = keyof typeof STORAGE_KEYS;
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type ThemeMode = typeof THEME.MODES[keyof typeof THEME.MODES];