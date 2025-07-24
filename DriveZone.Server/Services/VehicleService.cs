using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.ResultModel;
using DriveZone.Server.Services.IServices;
using DriveZone.Server.Data.Repositories.IRepositories;

namespace DriveZone.Server.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(IVehicleRepository vehicleRepository, ILogger<VehicleService> logger)
        {
            _vehicleRepository = vehicleRepository;
            _logger = logger;
        }

        public async Task<ResultModel<Vehicle>> AddVehicleAsync(Vehicle vehicle)
        {
            try
            {
                // Validate vehicle data
                if (string.IsNullOrEmpty(vehicle.Make) || string.IsNullOrEmpty(vehicle.Model))
                {
                    return ResultModel<Vehicle>.Error("Vehicle make and model are required");
                }

                if (vehicle.DailyRate <= 0 || vehicle.HourlyRate <= 0)
                {
                    return ResultModel<Vehicle>.Error("Vehicle rates must be greater than zero");
                }

                if (vehicle.ManufactureYear < 1900 || vehicle.ManufactureYear > DateTime.Now.Year + 1)
                {
                    return ResultModel<Vehicle>.Error("Invalid manufacture year");
                }

                var result = await _vehicleRepository.AddVehicleAsync(vehicle);
                if (result == null)
                {
                    return ResultModel<Vehicle>.Error("Failed to add vehicle");
                }

                _logger.LogInformation("Vehicle added successfully: {VehicleId}", result.VehicleId);
                return ResultModel<Vehicle>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding vehicle");
                return ResultModel<Vehicle>.Error("Internal error while adding vehicle");
            }
        }

        public async Task<ResultModel<List<Vehicle>>> GetVehiclesAsync(VehicleCategory? category = null, LocationCode? location = null, bool availableOnly = false)
        {
            try
            {
                var vehicles = await _vehicleRepository.GetVehiclesAsync(category, location, availableOnly);
                return ResultModel<List<Vehicle>>.Success(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles");
                return ResultModel<List<Vehicle>>.Error("Failed to retrieve vehicles");
            }
        }

        public async Task<ResultModel<Vehicle>> GetVehicleByIdAsync(string vehicleId)
        {
            try
            {
                if (string.IsNullOrEmpty(vehicleId))
                {
                    return ResultModel<Vehicle>.Error("Vehicle ID is required");
                }

                var vehicle = await _vehicleRepository.GetVehicleByIdAsync(vehicleId);
                if (vehicle == null)
                {
                    return ResultModel<Vehicle>.Error("Vehicle not found");
                }

                return ResultModel<Vehicle>.Success(vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle by ID: {VehicleId}", vehicleId);
                return ResultModel<Vehicle>.Error("Failed to retrieve vehicle");
            }
        }

        public async Task<ResultModel<IEnumerable<Vehicle>>> GetVehiclesByLocationAsync(LocationCode location)
        {
            try
            {
                var vehicles = await _vehicleRepository.GetVehiclesByLocationAsync(location);
                return ResultModel<IEnumerable<Vehicle>>.Success(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles by location: {Location}", location);
                return ResultModel<IEnumerable<Vehicle>>.Error("Failed to retrieve vehicles by location");
            }
        }

        public async Task<ResultModel<IEnumerable<Vehicle>>> GetVehiclesByCategoryAsync(VehicleCategory category)
        {
            try
            {
                var vehicles = await _vehicleRepository.GetVehiclesByCategoryAsync(category);
                return ResultModel<IEnumerable<Vehicle>>.Success(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles by category: {Category}", category);
                return ResultModel<IEnumerable<Vehicle>>.Error("Failed to retrieve vehicles by category");
            }
        }

        public async Task<ResultModel<IEnumerable<Vehicle>>> SearchVehiclesAsync(
            LocationCode? location = null,
            VehicleCategory? category = null,
            FuelType? fuelType = null,
            TransmissionType? transmission = null,
            int? minSeating = null,
            decimal? maxDailyRate = null,
            DateTime? availableFrom = null,
            DateTime? availableTo = null)
        {
            try
            {
                // Validate date range if provided
                if (availableFrom.HasValue && availableTo.HasValue && availableFrom >= availableTo)
                {
                    return ResultModel<IEnumerable<Vehicle>>.Error("Invalid date range");
                }

                var vehicles = await _vehicleRepository.SearchVehiclesAsync(
                    location, category, fuelType, transmission, minSeating, maxDailyRate, availableFrom, availableTo);

                return ResultModel<IEnumerable<Vehicle>>.Success(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles");
                return ResultModel<IEnumerable<Vehicle>>.Error("Failed to search vehicles");
            }
        }

        public async Task<ResultModel<Vehicle>> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                if (string.IsNullOrEmpty(vehicle.VehicleId))
                {
                    return ResultModel<Vehicle>.Error("Vehicle ID is required");
                }

                // Validate vehicle data
                if (string.IsNullOrEmpty(vehicle.Make) || string.IsNullOrEmpty(vehicle.Model))
                {
                    return ResultModel<Vehicle>.Error("Vehicle make and model are required");
                }

                if (vehicle.DailyRate <= 0 || vehicle.HourlyRate <= 0)
                {
                    return ResultModel<Vehicle>.Error("Vehicle rates must be greater than zero");
                }

                var success = await _vehicleRepository.UpdateVehicleAsync(vehicle);
                if (!success)
                {
                    return ResultModel<Vehicle>.Error("Failed to update vehicle");
                }

                var updatedVehicle = await _vehicleRepository.GetVehicleByIdAsync(vehicle.VehicleId);
                if (updatedVehicle == null)
                {
                    return ResultModel<Vehicle>.Error("Vehicle not found after update");
                }

                _logger.LogInformation("Vehicle updated successfully: {VehicleId}", vehicle.VehicleId);
                return ResultModel<Vehicle>.Success(updatedVehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle: {VehicleId}", vehicle.VehicleId);
                return ResultModel<Vehicle>.Error("Internal error while updating vehicle");
            }
        }

        public async Task<ResultModel<bool>> DeleteVehicleAsync(string vehicleId)
        {
            try
            {
                if (string.IsNullOrEmpty(vehicleId))
                {
                    return ResultModel<bool>.Error("Vehicle ID is required");
                }

                var success = await _vehicleRepository.DeleteVehicleAsync(vehicleId);
                if (!success)
                {
                    return ResultModel<bool>.Error("Failed to delete vehicle or vehicle has active bookings");
                }

                _logger.LogInformation("Vehicle deleted successfully: {VehicleId}", vehicleId);
                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle: {VehicleId}", vehicleId);
                return ResultModel<bool>.Error("Internal error while deleting vehicle");
            }
        }

        public async Task<ResultModel<bool>> UpdateVehicleAvailabilityAsync(string vehicleId, bool isAvailable)
        {
            try
            {
                if (string.IsNullOrEmpty(vehicleId))
                {
                    return ResultModel<bool>.Error("Vehicle ID is required");
                }

                var success = await _vehicleRepository.UpdateVehicleAvailabilityAsync(vehicleId, isAvailable);
                if (!success)
                {
                    return ResultModel<bool>.Error("Failed to update vehicle availability");
                }

                _logger.LogInformation("Vehicle availability updated: {VehicleId} - Available: {IsAvailable}", vehicleId, isAvailable);
                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle availability: {VehicleId}", vehicleId);
                return ResultModel<bool>.Error("Internal error while updating vehicle availability");
            }
        }

        public async Task<ResultModel<IEnumerable<VehicleMaintenanceRecord>>> GetMaintenanceHistoryAsync(string vehicleId)
        {
            try
            {
                // This would typically come from a separate MaintenanceRepository
                // For now, return empty list as placeholder
                var records = new List<VehicleMaintenanceRecord>();
                return ResultModel<IEnumerable<VehicleMaintenanceRecord>>.Success(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting maintenance history: {VehicleId}", vehicleId);
                return ResultModel<IEnumerable<VehicleMaintenanceRecord>>.Error("Failed to retrieve maintenance history");
            }
        }

        public async Task<ResultModel<VehicleMaintenanceRecord>> AddMaintenanceRecordAsync(string vehicleId, VehicleMaintenanceRecord record)
        {
            try
            {
                // This would typically be handled by a separate MaintenanceRepository
                // For now, return success as placeholder
                record.VehicleId = vehicleId;
                record.RecordId = Guid.NewGuid().ToString();

                _logger.LogInformation("Maintenance record added for vehicle: {VehicleId}", vehicleId);
                return ResultModel<VehicleMaintenanceRecord>.Success(record);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding maintenance record: {VehicleId}", vehicleId);
                return ResultModel<VehicleMaintenanceRecord>.Error("Failed to add maintenance record");
            }
        }

        public async Task<ResultModel<VehicleStatisticsDTO>> GetVehicleStatisticsAsync()
        {
            try
            {
                var statistics = await _vehicleRepository.GetVehicleStatisticsAsync();
                return ResultModel<VehicleStatisticsDTO>.Success(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle statistics");
                return ResultModel<VehicleStatisticsDTO>.Error("Failed to retrieve vehicle statistics");
            }
        }

        public async Task<ResultModel<bool>> IsVehicleAvailableAsync(string vehicleId, DateTime startDate, DateTime endDate)
        {
            try
            {
                if (string.IsNullOrEmpty(vehicleId))
                {
                    return ResultModel<bool>.Error("Vehicle ID is required");
                }

                if (startDate >= endDate)
                {
                    return ResultModel<bool>.Error("Invalid date range");
                }

                if (startDate < DateTime.Now.Date)
                {
                    return ResultModel<bool>.Error("Start date cannot be in the past");
                }

                var isAvailable = await _vehicleRepository.IsVehicleAvailableAsync(vehicleId, startDate, endDate);
                return ResultModel<bool>.Success(isAvailable);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking vehicle availability: {VehicleId}", vehicleId);
                return ResultModel<bool>.Error("Failed to check vehicle availability");
            }
        }
    }
}