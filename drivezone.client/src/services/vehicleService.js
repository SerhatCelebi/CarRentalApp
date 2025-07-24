import axios from "axios";

const API_BASE = "/api/Vehicle";

// Create axios instance with DriveZone specific configuration
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "X-DriveZone-Client": "Web-App",
  },
  timeout: 15000, // 15 seconds timeout for image loading
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("driveZoneToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("driveZoneToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Get all available vehicles in DriveZone fleet
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of vehicles
 */
export async function getAllVehicles(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);
    if (filters.availableOnly) params.append("availableOnly", "true");

    const response = await axiosInstance.get(`?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch vehicles"
      );
    }
    throw new Error("Network error while fetching vehicles");
  }
}

/**
 * Get vehicle details by ID
 * @param {string} vehicleId Vehicle ID
 * @returns {Promise<Object>} Vehicle details
 */
export async function getVehicleById(vehicleId) {
  try {
    const response = await axiosInstance.get(`/${vehicleId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Vehicle not found");
    }
    throw new Error("Failed to fetch vehicle details");
  }
}

/**
 * Get vehicles by location
 * @param {string} location Location code
 * @returns {Promise<Array>} List of vehicles
 */
export async function getVehiclesByLocation(location) {
  try {
    const response = await axiosInstance.get(`/location/${location}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch vehicles by location");
  }
}

/**
 * Get vehicles by category
 * @param {string} category Vehicle category
 * @returns {Promise<Array>} List of vehicles
 */
export async function getVehiclesByCategory(category) {
  try {
    const response = await axiosInstance.get(`/category/${category}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch vehicles by category");
  }
}

/**
 * Search vehicles with advanced filters
 * @param {Object} searchCriteria Search parameters
 * @returns {Promise<Array>} List of matching vehicles
 */
export async function searchVehicles(searchCriteria) {
  try {
    const params = new URLSearchParams();

    Object.entries(searchCriteria).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await axiosInstance.get(`/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to search vehicles");
  }
}

/**
 * Admin only: Add a new vehicle to fleet
 * @param {Object} vehicleData Vehicle information
 * @returns {Promise<Object>} Created vehicle
 */
export async function addVehicle(vehicleData) {
  try {
    const response = await axiosInstance.post("/", vehicleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to add vehicle");
    }
    throw new Error("Error adding vehicle");
  }
}

/**
 * Admin only: Update vehicle information
 * @param {string} vehicleId Vehicle ID
 * @param {Object} vehicleData Updated vehicle information
 * @returns {Promise<Object>} Updated vehicle
 */
export async function updateVehicle(vehicleId, vehicleData) {
  try {
    const response = await axiosInstance.put(`/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to update vehicle"
      );
    }
    throw new Error("Error updating vehicle");
  }
}

/**
 * Admin only: Delete vehicle from fleet
 * @param {string} vehicleId Vehicle ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteVehicle(vehicleId) {
  try {
    await axiosInstance.delete(`/${vehicleId}`);
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete vehicle"
      );
    }
    throw new Error("Error deleting vehicle");
  }
}

/**
 * Admin only: Update vehicle availability
 * @param {string} vehicleId Vehicle ID
 * @param {boolean} isAvailable Availability status
 * @returns {Promise<boolean>} Success status
 */
export async function updateVehicleAvailability(vehicleId, isAvailable) {
  try {
    await axiosInstance.put(`/${vehicleId}/availability`, isAvailable);
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to update vehicle availability"
      );
    }
    throw new Error("Error updating vehicle availability");
  }
}

// Helper functions for vehicle data
export const vehicleUtils = {
  /**
   * Format vehicle display name
   * @param {Object} vehicle Vehicle object
   * @returns {string} Formatted name
   */
  getDisplayName: (vehicle) => {
    if (!vehicle) return "";
    return `${vehicle.make} ${vehicle.model} (${vehicle.manufactureYear})`;
  },

  /**
   * Get category display name with icon
   * @param {string} category Vehicle category
   * @returns {string} Display name with icon
   */
  getCategoryDisplay: (category) => {
    const categories = {
      Economy: "🚗 Economy",
      Compact: "🚙 Compact",
      MidSize: "🚐 Mid-Size",
      FullSize: "🚚 Full-Size",
      Premium: "🏎️ Premium",
      Luxury: "💎 Luxury",
      SUV: "🚜 SUV",
      Van: "🚐 Van",
      Convertible: "🏎️ Convertible",
      Sports: "🏁 Sports",
      Electric: "⚡ Electric",
    };
    return categories[category] || category;
  },

  /**
   * Get fuel type display name with icon
   * @param {string} fuelType Fuel type
   * @returns {string} Display name with icon
   */
  getFuelTypeDisplay: (fuelType) => {
    const fuelTypes = {
      Gasoline: "⛽ Gasoline",
      Diesel: "🛢️ Diesel",
      Electric: "⚡ Electric",
      Hybrid: "🔋 Hybrid",
      PluginHybrid: "🔌 Plugin Hybrid",
    };
    return fuelTypes[fuelType] || fuelType;
  },

  /**
   * Get transmission display name
   * @param {string} transmission Transmission type
   * @returns {string} Display name
   */
  getTransmissionDisplay: (transmission) => {
    const transmissions = {
      Manual: "🎛️ Manual",
      Automatic: "⚙️ Automatic",
      CVT: "🔄 CVT",
    };
    return transmissions[transmission] || transmission;
  },

  /**
   * Format currency amount
   * @param {number} amount Amount in TRY
   * @returns {string} Formatted currency
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  },

  /**
   * Calculate total rental cost
   * @param {Object} vehicle Vehicle object
   * @param {number} days Number of days
   * @param {number} hours Additional hours
   * @returns {number} Total cost
   */
  calculateRentalCost: (vehicle, days = 0, hours = 0) => {
    if (!vehicle) return 0;

    const dailyCost = days * vehicle.dailyRate;
    const hourlyCost = hours * vehicle.hourlyRate;

    return dailyCost + hourlyCost;
  },

  /**
   * Check if vehicle is available for booking
   * @param {Object} vehicle Vehicle object
   * @returns {boolean} Availability status
   */
  isAvailableForBooking: (vehicle) => {
    return vehicle && vehicle.isAvailable;
  },

  /**
   * Get vehicle image URL or fallback
   * @param {Object} vehicle Vehicle object
   * @returns {string} Image URL
   */
  getImageUrl: (vehicle) => {
    if (vehicle?.imageUrl) {
      return vehicle.imageUrl;
    }

    // Fallback images based on category
    const fallbackImages = {
      Economy: "/images/vehicles/economy-default.jpg",
      Compact: "/images/vehicles/compact-default.jpg",
      Premium: "/images/vehicles/premium-default.jpg",
      Luxury: "/images/vehicles/luxury-default.jpg",
      SUV: "/images/vehicles/suv-default.jpg",
      Sports: "/images/vehicles/sports-default.jpg",
      Electric: "/images/vehicles/electric-default.jpg",
    };

    return (
      fallbackImages[vehicle?.category] ||
      "/images/vehicles/default-vehicle.jpg"
    );
  },
};
