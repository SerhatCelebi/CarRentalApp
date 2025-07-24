using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.ResultModel;
using DriveZone.Server.Models.DTOs;

namespace DriveZone.Server.Services.IServices
{
    public interface IVehicleService
    {
        /// <summary>
        /// Add a new vehicle to DriveZone fleet
        /// </summary>
        Task<ResultModel<Vehicle>> AddVehicleAsync(Vehicle vehicle);

        /// <summary>
        /// Get vehicles with optional filtering
        /// </summary>
        Task<ResultModel<List<Vehicle>>> GetVehiclesAsync(VehicleCategory? category = null,
            LocationCode? location = null, bool availableOnly = false);

        /// <summary>
        /// Get vehicle by ID
        /// </summary>
        Task<ResultModel<Vehicle>> GetVehicleByIdAsync(string vehicleId);

        /// <summary>
        /// Get vehicles by location
        /// </summary>
        Task<ResultModel<IEnumerable<Vehicle>>> GetVehiclesByLocationAsync(LocationCode location);

        /// <summary>
        /// Get vehicles by category
        /// </summary>
        Task<ResultModel<IEnumerable<Vehicle>>> GetVehiclesByCategoryAsync(VehicleCategory category);

        /// <summary>
        /// Search vehicles with advanced filters
        /// </summary>
        Task<ResultModel<IEnumerable<Vehicle>>> SearchVehiclesAsync(
            LocationCode? location = null,
            VehicleCategory? category = null,
            FuelType? fuelType = null,
            TransmissionType? transmission = null,
            int? minSeating = null,
            decimal? maxDailyRate = null,
            DateTime? availableFrom = null,
            DateTime? availableTo = null);

        /// <summary>
        /// Update vehicle information
        /// </summary>
        Task<ResultModel<Vehicle>> UpdateVehicleAsync(Vehicle vehicle);

        /// <summary>
        /// Delete vehicle from fleet
        /// </summary>
        Task<ResultModel<bool>> DeleteVehicleAsync(string vehicleId);

        /// <summary>
        /// Update vehicle availability status
        /// </summary>
        Task<ResultModel<bool>> UpdateVehicleAvailabilityAsync(string vehicleId, bool isAvailable);

        /// <summary>
        /// Get vehicle maintenance history
        /// </summary>
        Task<ResultModel<IEnumerable<VehicleMaintenanceRecord>>> GetMaintenanceHistoryAsync(string vehicleId);

        /// <summary>
        /// Add maintenance record for vehicle
        /// </summary>
        Task<ResultModel<VehicleMaintenanceRecord>> AddMaintenanceRecordAsync(string vehicleId, VehicleMaintenanceRecord record);

        /// <summary>
        /// Get vehicle statistics (admin only)
        /// </summary>
        Task<ResultModel<VehicleStatisticsDTO>> GetVehicleStatisticsAsync();

        /// <summary>
        /// Check if vehicle is available for specific date range
        /// </summary>
        Task<ResultModel<bool>> IsVehicleAvailableAsync(string vehicleId, DateTime startDate, DateTime endDate);
    }

    /// <summary>
    /// Vehicle maintenance record
    /// </summary>
    public class VehicleMaintenanceRecord
    {
        public string RecordId { get; set; } = Guid.NewGuid().ToString();
        public string VehicleId { get; set; } = string.Empty;
        public DateTime MaintenanceDate { get; set; }
        public string MaintenanceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public decimal MileageAtMaintenance { get; set; }
        public DateTime NextMaintenanceDue { get; set; }
    }

    /// <summary>
    /// Vehicle statistics DTO
    /// </summary>
    public class VehicleStatisticsDTO
    {
        public int TotalVehicles { get; set; }
        public int AvailableVehicles { get; set; }
        public int RentedVehicles { get; set; }
        public int MaintenanceVehicles { get; set; }
        public Dictionary<VehicleCategory, int> VehiclesByCategory { get; set; } = new();
        public Dictionary<LocationCode, int> VehiclesByLocation { get; set; } = new();
        public Dictionary<FuelType, int> VehiclesByFuelType { get; set; } = new();
        public decimal AverageUtilizationRate { get; set; }
        public decimal TotalFleetValue { get; set; }
    }
}