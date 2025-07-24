using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Data.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DriveZone.Server.Data.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly DriveZoneContext _context;
        private readonly ILogger<VehicleRepository> _logger;

        public VehicleRepository(DriveZoneContext context, ILogger<VehicleRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Vehicle?> AddVehicleAsync(Vehicle vehicle)
        {
            try
            {
                vehicle.VehicleId = Guid.NewGuid().ToString();
                vehicle.CreatedAt = DateTime.UtcNow;
                vehicle.IsAvailable = true;

                _context.Vehicles.Add(vehicle);
                var result = await _context.SaveChangesAsync();

                return result > 0 ? vehicle : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding vehicle");
                return null;
            }
        }

        public async Task<List<Vehicle>> GetVehiclesAsync(VehicleCategory? category = null, LocationCode? location = null, bool availableOnly = false)
        {
            try
            {
                var query = _context.Vehicles.AsQueryable();

                if (category.HasValue)
                    query = query.Where(v => v.Category == category.Value);

                if (location.HasValue)
                    query = query.Where(v => v.Location == location.Value);

                if (availableOnly)
                    query = query.Where(v => v.IsAvailable);

                return await query
                    .OrderBy(v => v.Make)
                    .ThenBy(v => v.Model)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles");
                return new List<Vehicle>();
            }
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(string vehicleId)
        {
            try
            {
                return await _context.Vehicles
                    .Include(v => v.Bookings)
                    .Include(v => v.MaintenanceRecords)
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle by ID: {VehicleId}", vehicleId);
                return null;
            }
        }

        public async Task<List<Vehicle>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate, VehicleCategory? category = null)
        {
            try
            {
                var query = _context.Vehicles
                    .Where(v => v.IsAvailable)
                    .Where(v => !_context.Bookings.Any(b =>
                        b.VehicleId == v.VehicleId &&
                        b.Status != BookingStatus.Cancelled &&
                        b.Status != BookingStatus.Completed &&
                        ((b.BookingStartDate <= startDate && b.BookingEndDate >= startDate) ||
                         (b.BookingStartDate <= endDate && b.BookingEndDate >= endDate) ||
                         (b.BookingStartDate >= startDate && b.BookingEndDate <= endDate))));

                if (category.HasValue)
                    query = query.Where(v => v.Category == category.Value);

                return await query
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available vehicles");
                return new List<Vehicle>();
            }
        }

        public async Task<List<Vehicle>> SearchVehiclesAsync(string make, string model, VehicleCategory? category = null, decimal? maxDailyRate = null)
        {
            try
            {
                var query = _context.Vehicles
                    .Where(v => v.IsAvailable)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(make))
                    query = query.Where(v => v.Make.Contains(make));

                if (!string.IsNullOrEmpty(model))
                    query = query.Where(v => v.Model.Contains(model));

                if (category.HasValue)
                    query = query.Where(v => v.Category == category.Value);

                if (maxDailyRate.HasValue)
                    query = query.Where(v => v.DailyRate <= maxDailyRate.Value);

                return await query
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles");
                return new List<Vehicle>();
            }
        }

        public async Task<bool> UpdateVehicleAsync(Vehicle vehicle)
        {
            try
            {
                vehicle.UpdatedAt = DateTime.UtcNow;
                _context.Vehicles.Update(vehicle);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle: {VehicleId}", vehicle.VehicleId);
                return false;
            }
        }

        public async Task<bool> DeleteVehicleAsync(string vehicleId)
        {
            try
            {
                var vehicle = await GetVehicleByIdAsync(vehicleId);
                if (vehicle == null) return false;

                // Check if vehicle has active bookings
                var hasActiveBookings = await _context.Bookings
                    .AnyAsync(b => b.VehicleId == vehicleId &&
                                  (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Active));

                if (hasActiveBookings)
                {
                    _logger.LogWarning("Cannot delete vehicle with active bookings: {VehicleId}", vehicleId);
                    return false;
                }

                _context.Vehicles.Remove(vehicle);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle: {VehicleId}", vehicleId);
                return false;
            }
        }

        public async Task<bool> UpdateVehicleAvailabilityAsync(string vehicleId, bool isAvailable)
        {
            try
            {
                var vehicle = await GetVehicleByIdAsync(vehicleId);
                if (vehicle == null) return false;

                vehicle.IsAvailable = isAvailable;
                vehicle.UpdatedAt = DateTime.UtcNow;

                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle availability: {VehicleId}", vehicleId);
                return false;
            }
        }

        public async Task<VehicleStatisticsDTO> GetVehicleStatisticsAsync()
        {
            try
            {
                var totalVehicles = await _context.Vehicles.CountAsync();
                var availableVehicles = await _context.Vehicles.CountAsync(v => v.IsAvailable);
                var rentedVehicles = totalVehicles - availableVehicles;

                var vehiclesByCategory = await _context.Vehicles
                    .GroupBy(v => v.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .ToListAsync();

                return new VehicleStatisticsDTO
                {
                    TotalVehicles = totalVehicles,
                    AvailableVehicles = availableVehicles,
                    RentedVehicles = rentedVehicles,
                    UtilizationRate = totalVehicles > 0 ? (decimal)rentedVehicles / totalVehicles * 100 : 0,
                    VehiclesByCategory = vehiclesByCategory.ToDictionary(x => x.Category.ToString(), x => x.Count)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle statistics");
                return new VehicleStatisticsDTO();
            }
        }

        public async Task<List<Vehicle>> GetVehiclesNeedingMaintenanceAsync()
        {
            try
            {
                // Vehicles with high mileage or old manufacture year
                return await _context.Vehicles
                    .Where(v => v.Mileage > 100000 || v.ManufactureYear < DateTime.Now.Year - 10)
                    .OrderByDescending(v => v.Mileage)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles needing maintenance");
                return new List<Vehicle>();
            }
        }

        public async Task<decimal> GetVehicleUtilizationRateAsync(string vehicleId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var totalDays = (toDate - fromDate).Days;
                if (totalDays <= 0) return 0;

                var bookedDays = await _context.Bookings
                    .Where(b => b.VehicleId == vehicleId &&
                               b.Status == BookingStatus.Completed &&
                               b.BookingStartDate >= fromDate &&
                               b.BookingEndDate <= toDate)
                    .SumAsync(b => EF.Functions.DateDiffDay(b.BookingStartDate, b.BookingEndDate));

                return totalDays > 0 ? (decimal)bookedDays / totalDays * 100 : 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating vehicle utilization rate: {VehicleId}", vehicleId);
                return 0;
            }
        }

        public async Task<IEnumerable<Vehicle>> GetVehiclesByLocationAsync(LocationCode location)
        {
            try
            {
                return await _context.Vehicles
                    .Where(v => v.Location == location && v.IsAvailable)
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles by location: {Location}", location);
                return new List<Vehicle>();
            }
        }

        public async Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(VehicleCategory category)
        {
            try
            {
                return await _context.Vehicles
                    .Where(v => v.Category == category && v.IsAvailable)
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles by category: {Category}", category);
                return new List<Vehicle>();
            }
        }

        public async Task<IEnumerable<Vehicle>> SearchVehiclesAsync(
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
                var query = _context.Vehicles
                    .Where(v => v.IsAvailable)
                    .AsQueryable();

                if (location.HasValue)
                    query = query.Where(v => v.Location == location.Value);

                if (category.HasValue)
                    query = query.Where(v => v.Category == category.Value);

                if (fuelType.HasValue)
                    query = query.Where(v => v.FuelType == fuelType.Value);

                if (transmission.HasValue)
                    query = query.Where(v => v.Transmission == transmission.Value);

                if (minSeating.HasValue)
                    query = query.Where(v => v.SeatingCapacity >= minSeating.Value);

                if (maxDailyRate.HasValue)
                    query = query.Where(v => v.DailyRate <= maxDailyRate.Value);

                // Check availability for specific date range
                if (availableFrom.HasValue && availableTo.HasValue)
                {
                    query = query.Where(v => !_context.Bookings.Any(b =>
                        b.VehicleId == v.VehicleId &&
                        b.Status != BookingStatus.Cancelled &&
                        b.Status != BookingStatus.Completed &&
                        ((b.BookingStartDate <= availableFrom && b.BookingEndDate >= availableFrom) ||
                         (b.BookingStartDate <= availableTo && b.BookingEndDate >= availableTo) ||
                         (b.BookingStartDate >= availableFrom && b.BookingEndDate <= availableTo))));
                }

                return await query
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles with advanced filters");
                return new List<Vehicle>();
            }
        }

        public async Task<bool> IsVehicleAvailableAsync(string vehicleId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var vehicle = await GetVehicleByIdAsync(vehicleId);
                if (vehicle == null || !vehicle.IsAvailable)
                    return false;

                var hasConflictingBooking = await _context.Bookings
                    .AnyAsync(b => b.VehicleId == vehicleId &&
                                  b.Status != BookingStatus.Cancelled &&
                                  b.Status != BookingStatus.Completed &&
                                  ((b.BookingStartDate <= startDate && b.BookingEndDate >= startDate) ||
                                   (b.BookingStartDate <= endDate && b.BookingEndDate >= endDate) ||
                                   (b.BookingStartDate >= startDate && b.BookingEndDate <= endDate)));

                return !hasConflictingBooking;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking vehicle availability: {VehicleId}", vehicleId);
                return false;
            }
        }
    }
}