import axios from 'axios';

const API_BASE = '/api/Booking';

// Create axios instance with DriveZone specific configuration
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-DriveZone-Client': 'Web-App',
  },
  timeout: 20000, // 20 seconds timeout for payment processing
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('driveZoneToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('driveZoneToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Create a new booking for a vehicle
 * @param {Object} bookingData Booking information
 * @returns {Promise<Object>} Created booking
 */
export async function createBooking(bookingData) {
  try {
    const response = await axiosInstance.post('/', bookingData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create booking');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Error in setting up the booking request');
    }
  }
}

/**
 * Get member's bookings or all bookings (admin)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of bookings
 */
export async function getBookings(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const response = await axiosInstance.get(`?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch bookings');
    }
    throw new Error('Network error while fetching bookings');
  }
}

/**
 * Get booking details by ID
 * @param {string} bookingId Booking ID
 * @returns {Promise<Object>} Booking details
 */
export async function getBookingById(bookingId) {
  try {
    const response = await axiosInstance.get(`/${bookingId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Booking not found');
    }
    throw new Error('Failed to fetch booking details');
  }
}

/**
 * Get member's booking history
 * @param {string} memberId Member ID
 * @returns {Promise<Array>} List of member's bookings
 */
export async function getMemberBookings(memberId) {
  try {
    const response = await axiosInstance.get(`/member/${memberId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch member bookings');
  }
}

/**
 * Update booking information
 * @param {string} bookingId Booking ID
 * @param {Object} bookingData Updated booking information
 * @returns {Promise<Object>} Updated booking
 */
export async function updateBooking(bookingId, bookingData) {
  try {
    const response = await axiosInstance.put(`/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update booking');
    }
    throw new Error('Error updating booking');
  }
}

/**
 * Cancel a booking
 * @param {string} bookingId Booking ID
 * @param {string} cancellationReason Optional cancellation reason
 * @returns {Promise<boolean>} Success status
 */
export async function cancelBooking(bookingId, cancellationReason = null) {
  try {
    await axiosInstance.put(`/${bookingId}/cancel`, cancellationReason);
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to cancel booking');
    }
    throw new Error('Error cancelling booking');
  }
}

/**
 * Admin only: Update booking status
 * @param {string} bookingId Booking ID
 * @param {string} status New booking status
 * @returns {Promise<boolean>} Success status
 */
export async function updateBookingStatus(bookingId, status) {
  try {
    await axiosInstance.put(`/${bookingId}/status`, status);
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update booking status');
    }
    throw new Error('Error updating booking status');
  }
}

/**
 * Get available vehicles for booking in date range
 * @param {Date} startDate Start date
 * @param {Date} endDate End date
 * @param {Object} filters Optional filters
 * @returns {Promise<Array>} List of available vehicles
 */
export async function getAvailableVehicles(startDate, endDate, filters = {}) {
  try {
    const params = new URLSearchParams();

    params.append('startDate', startDate.toISOString());
    params.append('endDate', endDate.toISOString());

    if (filters.location) params.append('location', filters.location);
    if (filters.category) params.append('category', filters.category);

    const response = await axiosInstance.get(`/available?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('Invalid date range provided');
    }
    throw new Error('Failed to fetch available vehicles');
  }
}

/**
 * Calculate booking cost estimate
 * @param {Object} estimateData Cost estimation parameters
 * @returns {Promise<Object>} Cost estimate with breakdown
 */
export async function calculateBookingCost(estimateData) {
  try {
    const response = await axiosInstance.post('/estimate', estimateData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to calculate booking cost');
    }
    throw new Error('Error calculating booking cost');
  }
}

/**
 * Get current member's bookings
 * @param {Object} filters - Optional filters for member's bookings
 * @returns {Promise<Array>} List of member's bookings
 */
export async function getMyBookings(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const response = await axiosInstance.get(`/my?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch my bookings');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Error in fetching my bookings');
    }
  }
}

// Helper functions for booking data
export const bookingUtils = {
  /**
   * Format booking reference for display
   * @param {Object} booking Booking object
   * @returns {string} Formatted reference
   */
  getDisplayReference: booking => {
    if (!booking?.bookingReference) return '';
    return `#${booking.bookingReference}`;
  },

  /**
   * Get booking status display with color
   * @param {string} status Booking status
   * @returns {Object} Status display info
   */
  getStatusDisplay: status => {
    const statusInfo = {
      Pending: { text: 'Beklemede', color: 'warning', icon: '⏳' },
      Confirmed: { text: 'Onaylandı', color: 'success', icon: '✅' },
      Active: { text: 'Aktif', color: 'primary', icon: '🚗' },
      Completed: { text: 'Tamamlandı', color: 'info', icon: '🏁' },
      Cancelled: { text: 'İptal Edildi', color: 'danger', icon: '❌' },
      NoShow: { text: 'Gelmedi', color: 'secondary', icon: '👻' },
    };
    return statusInfo[status] || { text: status, color: 'secondary', icon: '❓' };
  },

  /**
   * Get insurance type display
   * @param {string} insuranceType Insurance type
   * @returns {string} Display name
   */
  getInsuranceDisplay: insuranceType => {
    const insuranceTypes = {
      Basic: '🛡️ Temel Sigorta',
      Premium: '🛡️ Premium Sigorta',
      Comprehensive: '🛡️ Kapsamlı Sigorta',
    };
    return insuranceTypes[insuranceType] || insuranceType;
  },

  /**
   * Format booking duration
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   * @returns {string} Formatted duration
   */
  formatDuration: (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffDays >= 1) {
      return `${diffDays} gün`;
    } else {
      return `${diffHours} saat`;
    }
  },

  /**
   * Calculate days until booking
   * @param {Date} bookingDate Booking start date
   * @returns {number} Days until booking
   */
  getDaysUntilBooking: bookingDate => {
    if (!bookingDate) return 0;

    const booking = new Date(bookingDate);
    const today = new Date();
    const diffTime = booking - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  },

  /**
   * Check if booking can be cancelled
   * @param {Object} booking Booking object
   * @returns {boolean} Can be cancelled
   */
  canBeCancelled: booking => {
    if (!booking) return false;

    const cancellableStatuses = ['Pending', 'Confirmed'];
    if (!cancellableStatuses.includes(booking.status)) {
      return false;
    }

    // Can't cancel if booking starts within 24 hours
    const hoursUntilBooking = bookingUtils.getDaysUntilBooking(booking.bookingStartDate) * 24;
    return hoursUntilBooking > 24;
  },

  /**
   * Check if booking can be modified
   * @param {Object} booking Booking object
   * @returns {boolean} Can be modified
   */
  canBeModified: booking => {
    if (!booking) return false;

    const modifiableStatuses = ['Pending', 'Confirmed'];
    if (!modifiableStatuses.includes(booking.status)) {
      return false;
    }

    // Can't modify if booking starts within 48 hours
    const hoursUntilBooking = bookingUtils.getDaysUntilBooking(booking.bookingStartDate) * 24;
    return hoursUntilBooking > 48;
  },

  /**
   * Format booking date range for display
   * @param {string} startDate Start date
   * @param {string} endDate End date
   * @returns {string} Formatted date range
   */
  formatDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    const start = new Date(startDate).toLocaleDateString('tr-TR', options);
    const end = new Date(endDate).toLocaleDateString('tr-TR', options);

    return `${start} - ${end}`;
  },

  /**
   * Calculate total cost including taxes and fees
   * @param {Object} booking Booking object
   * @returns {number} Total cost
   */
  calculateTotalCost: booking => {
    if (!booking) return 0;

    const baseAmount = booking.baseAmount || 0;
    const taxAmount = booking.taxAmount || 0;
    const securityDeposit = booking.securityDeposit || 0;
    const insuranceCost = booking.insuranceCost || 0;

    return baseAmount + taxAmount + insuranceCost; // Security deposit is separate
  },
};
