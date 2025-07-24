import axios from 'axios';
import { jwtUtils } from '../utils/jwt';

const API_BASE = '/api/Member';

// Create axios instance with DriveZone specific configuration
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-DriveZone-Client': 'Web-App',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = jwtUtils.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      jwtUtils.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Member service methods
export const memberService = {
  // Register a new member
  register: async (memberData) => {
    try {
      const response = await axiosInstance.post('/register', memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login member
  login: async (loginData) => {
    try {
      const response = await axiosInstance.post('/login', loginData);
      const { token, member } = response.data;
      
      if (token) {
        jwtUtils.setToken(token);
      }
      
      return { token, member };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Get member profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update member profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Get member loyalty info
  getLoyaltyInfo: async () => {
    try {
      const response = await axiosInstance.get('/loyalty');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty info');
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.post('/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Logout
  logout: () => {
    jwtUtils.removeToken();
    window.location.href = '/';
  },

  // Check if member is authenticated
  isAuthenticated: () => {
    const token = jwtUtils.getToken();
    return token && !jwtUtils.isTokenExpired(token);
  },

  // Get current member from token
  getCurrentMember: () => {
    const token = jwtUtils.getToken();
    if (token && !jwtUtils.isTokenExpired(token)) {
      return jwtUtils.getUserFromToken(token);
    }
    return null;
  },

  // Admin: Get all members
  getAllMembers: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/all`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch members');
    }
  },

  // Admin: Update member status
  updateMemberStatus: async (memberId, statusData) => {
    try {
      const response = await axiosInstance.put(`/${memberId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update member status');
    }
  },

  // Get member statistics (admin)
  getMemberStatistics: async () => {
    try {
      const response = await axiosInstance.get('/statistics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member statistics');
    }
  }
};

// Member utility functions
export const memberUtils = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Turkish format)
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate password strength
  isStrongPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Calculate age from birth date
  calculateAge: (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Check if member is eligible for rental (21+ years old)
  isEligibleForRental: (birthDate) => {
    return memberUtils.calculateAge(birthDate) >= 21;
  },

  // Format membership tier display name
  getMembershipTierDisplay: (tier) => {
    const tiers = {
      'Bronze': 'Bronz',
      'Silver': 'Gümüş', 
      'Gold': 'Altın',
      'Platinum': 'Platin'
    };
    return tiers[tier] || tier;
  },

  // Get membership tier color
  getMembershipTierColor: (tier) => {
    const colors = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2'
    };
    return colors[tier] || '#6c757d';
  },

  // Format currency display
  formatCurrency: (amount, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // Format member ID for display
  formatMemberId: (memberId) => {
    return memberId.replace(/(.{2})(.{4})(.{4})/, '$1-$2-$3');
  },

  // Check if driver license is valid (expires in 30+ days)
  isDriverLicenseValid: (expiryDate) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return expiry > thirtyDaysFromNow;
  },

  // Generate member dashboard greeting
  getDashboardGreeting: (member) => {
    const hour = new Date().getHours();
    let greeting = 'Merhaba';
    
    if (hour < 12) {
      greeting = 'Günaydın';
    } else if (hour < 17) {
      greeting = 'İyi öğleden sonra';
    } else {
      greeting = 'İyi akşamlar';
    }
    
    return `${greeting} ${member.firstName}!`;
  }
};

export default memberService;
