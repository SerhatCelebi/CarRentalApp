using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;

namespace DriveZone.Server.Data.Repositories.IRepositories
{
    public interface IVehicleRepository
    {
        Task<Vehicle?> AddVehicleAsync(Vehicle vehicle);
        Task<List<Vehicle>> GetVehiclesAsync(VehicleCategory? category = null, LocationCode? location = null, bool availableOnly = false);
        Task<Vehicle?> GetVehicleByIdAsync(string vehicleId);
        Task<List<Vehicle>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate, VehicleCategory? category = null);
        Task<List<Vehicle>> SearchVehiclesAsync(string make, string model, VehicleCategory? category = null, decimal? maxDailyRate = null);
        Task<IEnumerable<Vehicle>> SearchVehiclesAsync(LocationCode? location = null, VehicleCategory? category = null, FuelType? fuelType = null, TransmissionType? transmission = null, int? minSeating = null, decimal? maxDailyRate = null, DateTime? availableFrom = null, DateTime? availableTo = null);
        Task<IEnumerable<Vehicle>> GetVehiclesByLocationAsync(LocationCode location);
        Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(VehicleCategory category);
        Task<bool> IsVehicleAvailableAsync(string vehicleId, DateTime startDate, DateTime endDate);
        Task<bool> UpdateVehicleAsync(Vehicle vehicle);
        Task<bool> DeleteVehicleAsync(string vehicleId);
        Task<bool> UpdateVehicleAvailabilityAsync(string vehicleId, bool isAvailable);
        Task<VehicleStatisticsDTO> GetVehicleStatisticsAsync();
        Task<List<Vehicle>> GetVehiclesNeedingMaintenanceAsync();
        Task<decimal> GetVehicleUtilizationRateAsync(string vehicleId, DateTime fromDate, DateTime toDate);
    }
}