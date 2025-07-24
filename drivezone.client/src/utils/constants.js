// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://localhost:7042/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'drivezone_token',
  REFRESH_TOKEN_KEY: 'drivezone_refresh_token',
  TOKEN_EXPIRY_BUFFER: 60000, // 1 minute in milliseconds
  AUTO_REFRESH_ENABLED: true,
  LOGOUT_ON_EXPIRY: true,
};

// Vehicle Categories
export const VEHICLE_CATEGORIES = {
  COMPACT: 'Compact',
  MIDSIZE: 'Midsize',
  FULLSIZE: 'Fullsize',
  LUXURY: 'Luxury',
  SUV: 'SUV',
  PREMIUM: 'Premium',
};

// Vehicle Category Labels (Turkish)
export const VEHICLE_CATEGORY_LABELS = {
  [VEHICLE_CATEGORIES.COMPACT]: 'Kompakt',
  [VEHICLE_CATEGORIES.MIDSIZE]: 'Orta Sınıf',
  [VEHICLE_CATEGORIES.FULLSIZE]: 'Büyük Sınıf',
  [VEHICLE_CATEGORIES.LUXURY]: 'Lüks',
  [VEHICLE_CATEGORIES.SUV]: 'SUV',
  [VEHICLE_CATEGORIES.PREMIUM]: 'Premium',
};

// Fuel Types
export const FUEL_TYPES = {
  GASOLINE: 'Gasoline',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric',
};

// Fuel Type Labels (Turkish)
export const FUEL_TYPE_LABELS = {
  [FUEL_TYPES.GASOLINE]: 'Benzin',
  [FUEL_TYPES.DIESEL]: 'Dizel',
  [FUEL_TYPES.HYBRID]: 'Hibrit',
  [FUEL_TYPES.ELECTRIC]: 'Elektrik',
};

// Transmission Types
export const TRANSMISSION_TYPES = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  SEMI_AUTOMATIC: 'SemiAutomatic',
};

// Transmission Type Labels (Turkish)
export const TRANSMISSION_TYPE_LABELS = {
  [TRANSMISSION_TYPES.MANUAL]: 'Manuel',
  [TRANSMISSION_TYPES.AUTOMATIC]: 'Otomatik',
  [TRANSMISSION_TYPES.SEMI_AUTOMATIC]: 'Yarı Otomatik',
};

// Booking Statuses
export const BOOKING_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Booking Status Labels (Turkish)
export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUSES.PENDING]: 'Beklemede',
  [BOOKING_STATUSES.CONFIRMED]: 'Onaylandı',
  [BOOKING_STATUSES.ACTIVE]: 'Aktif',
  [BOOKING_STATUSES.COMPLETED]: 'Tamamlandı',
  [BOOKING_STATUSES.CANCELLED]: 'İptal Edildi',
};

// Status Colors
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUSES.PENDING]: 'warning',
  [BOOKING_STATUSES.CONFIRMED]: 'info',
  [BOOKING_STATUSES.ACTIVE]: 'success',
  [BOOKING_STATUSES.COMPLETED]: 'secondary',
  [BOOKING_STATUSES.CANCELLED]: 'danger',
};

// Location Codes
export const LOCATION_CODES = {
  TR: 'Turkey',
  IST: 'Istanbul',
  ANK: 'Ankara',
  IZM: 'Izmir',
};

// Location Labels (Turkish)
export const LOCATION_LABELS = {
  [LOCATION_CODES.TR]: 'Türkiye',
  [LOCATION_CODES.IST]: 'İstanbul',
  [LOCATION_CODES.ANK]: 'Ankara',
  [LOCATION_CODES.IZM]: 'İzmir',
};

// Membership Tiers
export const MEMBERSHIP_TIERS = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
};

// Membership Tier Labels (Turkish)
export const MEMBERSHIP_TIER_LABELS = {
  [MEMBERSHIP_TIERS.BRONZE]: 'Bronz',
  [MEMBERSHIP_TIERS.SILVER]: 'Gümüş',
  [MEMBERSHIP_TIERS.GOLD]: 'Altın',
  [MEMBERSHIP_TIERS.PLATINUM]: 'Platin',
};

// Payment Statuses
export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

// Payment Status Labels (Turkish)
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PENDING]: 'Beklemede',
  [PAYMENT_STATUSES.PAID]: 'Ödendi',
  [PAYMENT_STATUSES.FAILED]: 'Başarısız',
  [PAYMENT_STATUSES.REFUNDED]: 'İade Edildi',
};

// Insurance Types
export const INSURANCE_TYPES = {
  BASIC: 'Basic',
  PREMIUM: 'Premium',
  COMPREHENSIVE: 'Comprehensive',
};

// Insurance Type Labels (Turkish)
export const INSURANCE_TYPE_LABELS = {
  [INSURANCE_TYPES.BASIC]: 'Temel',
  [INSURANCE_TYPES.PREMIUM]: 'Premium',
  [INSURANCE_TYPES.COMPREHENSIVE]: 'Kapsamlı',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'DriveZone',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'DriveZone Platform',
  SUPPORT_EMAIL: 'support@drivezone.com',
  DEFAULT_CURRENCY: 'TRY',
  DEFAULT_LANGUAGE: 'tr',
  ITEMS_PER_PAGE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'drivezone_token',
  USER_DATA: 'drivezone_user',
  LANGUAGE: 'drivezone_language',
  THEME: 'drivezone_theme',
  SEARCH_HISTORY: 'drivezone_search_history',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  MEMBERS: {
    PROFILE: '/member/profile',
    LOYALTY: '/member/loyalty',
    ALL: '/member/all',
    STATISTICS: '/member/statistics',
  },
  VEHICLES: {
    ALL: '/vehicle',
    BY_ID: '/vehicle/:id',
    SEARCH: '/vehicle/search',
    AVAILABLE: '/vehicle/available',
    STATISTICS: '/vehicle/statistics',
  },
  BOOKINGS: {
    ALL: '/booking',
    BY_ID: '/booking/:id',
    CREATE: '/booking',
    CANCEL: '/booking/:id/cancel',
    MY_BOOKINGS: '/booking/my',
    STATISTICS: '/booking/statistics',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    MEMBERS: '/admin/members',
    VEHICLES: '/admin/vehicles',
    BOOKINGS: '/admin/bookings',
    MAINTENANCE: '/admin/maintenance',
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^(\+90|0)?[5][0-9]{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PLATE_PATTERN: /^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/,
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_LOYALTY_PROGRAM: true,
  ENABLE_MAINTENANCE_MODULE: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_PWA: true,
};
