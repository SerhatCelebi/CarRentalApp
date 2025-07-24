import { AUTH_CONFIG } from './constants';

export const jwtUtils = {
  /**
   * Get JWT token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  getToken() {
    try {
      return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  },

  /**
   * Set JWT token in localStorage
   * @param {string} token - JWT token to store
   */
  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken() {
    try {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  },

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token or null if not found
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token from localStorage:', error);
      return null;
    }
  },

  /**
   * Set refresh token in localStorage
   * @param {string} refreshToken - Refresh token to store
   */
  setRefreshToken(refreshToken) {
    try {
      if (refreshToken) {
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error setting refresh token in localStorage:', error);
    }
  },

  /**
   * Decode JWT token without verification
   * @param {string} token - JWT token to decode
   * @returns {object|null} Decoded token payload or null if invalid
   */
  decodeToken(token) {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  },

  /**
   * Check if JWT token is expired
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token is expired or invalid
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = AUTH_CONFIG.TOKEN_EXPIRY_BUFFER / 1000; // Convert to seconds
      
      return decoded.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * Get user information from JWT token
   * @param {string} token - JWT token
   * @returns {object|null} User information or null if invalid
   */
  getUserFromToken(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      return {
        id: decoded.nameid || decoded.sub,
        email: decoded.email,
        name: decoded.name,
        firstName: decoded.given_name || this.extractFirstName(decoded.name),
        lastName: decoded.family_name || this.extractLastName(decoded.name),
        roles: decoded.role ? (Array.isArray(decoded.role) ? decoded.role : [decoded.role]) : [],
        membershipLevel: decoded.MembershipLevel || 'Bronze',
        loyaltyPoints: parseInt(decoded.LoyaltyPoints || '0'),
        isVip: decoded.IsVip === 'true' || decoded.IsVip === true,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  },

  /**
   * Extract first name from full name
   * @param {string} fullName - Full name
   * @returns {string} First name
   */
  extractFirstName(fullName) {
    if (!fullName) return '';
    return fullName.split(' ')[0] || '';
  },

  /**
   * Extract last name from full name
   * @param {string} fullName - Full name
   * @returns {string} Last name
   */
  extractLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  },

  /**
   * Check if current user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    try {
      const token = this.getToken();
      if (!token) return false;

      const user = this.getUserFromToken(token);
      return user?.roles?.includes(role) || false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  /**
   * Check if current user is admin
   * @returns {boolean} True if user is admin
   */
  isAdmin() {
    return this.hasRole('Admin');
  },

  /**
   * Check if current user is VIP
   * @returns {boolean} True if user is VIP
   */
  isVip() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const user = this.getUserFromToken(token);
      return user?.isVip || user?.membershipLevel === 'Gold' || user?.membershipLevel === 'Platinum';
    } catch (error) {
      console.error('Error checking VIP status:', error);
      return false;
    }
  },

  /**
   * Get token expiration time in milliseconds
   * @param {string} token - JWT token
   * @returns {number|null} Expiration time in milliseconds or null if invalid
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;

      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  },

  /**
   * Get time until token expires in milliseconds
   * @param {string} token - JWT token
   * @returns {number} Time in milliseconds until expiration (negative if expired)
   */
  getTimeUntilExpiration(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return -1;

      return expiration - Date.now();
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return -1;
    }
  },

  /**
   * Schedule token refresh before expiration
   * @param {function} refreshCallback - Function to call for token refresh
   * @returns {number|null} Timeout ID or null if no refresh needed
   */
  scheduleTokenRefresh(refreshCallback) {
    try {
      const token = this.getToken();
      if (!token || this.isTokenExpired(token)) return null;

      const timeUntilExpiration = this.getTimeUntilExpiration(token);
      const refreshTime = timeUntilExpiration - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER;

      if (refreshTime > 0) {
        return setTimeout(() => {
          refreshCallback();
        }, refreshTime);
      }

      return null;
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
      return null;
    }
  },

  /**
   * Validate token format
   * @param {string} token - JWT token to validate
   * @returns {boolean} True if token format is valid
   */
  isValidTokenFormat(token) {
    try {
      if (!token || typeof token !== 'string') return false;
      
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Try to decode each part
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Clear all auth-related data
   */
  clearAuth() {
    this.removeToken();
    // Clear any other auth-related localStorage items
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('drivezone_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};

export default jwtUtils;
