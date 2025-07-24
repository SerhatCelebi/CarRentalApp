using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.ResultModel;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<VehicleController> _logger;

        public VehicleController(IVehicleService vehicleService, ILogger<VehicleController> logger)
        {
            _vehicleService = vehicleService;
            _logger = logger;
        }

        /// <summary>
        /// Admin only: Add a new vehicle to DriveZone fleet
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] Vehicle vehicle)
        {
            if (vehicle == null)
            {
                return BadRequest("Invalid vehicle data");
            }

            try
            {
                var result = await _vehicleService.AddVehicleAsync(vehicle);

                if (result.HasError)
                {
                    _logger.LogError("Failed to add vehicle: {Error}", result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("New vehicle added successfully: {VehicleId} - {Make} {Model}",
                    result.Value.VehicleId, result.Value.Make, result.Value.Model);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding vehicle");
                return StatusCode(500, new { error = "An unexpected error occurred while adding vehicle" });
            }
        }

        /// <summary>
        /// Get all available vehicles in DriveZone fleet
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Vehicle>>> GetAllVehicles([FromQuery] VehicleCategory? category = null,
            [FromQuery] LocationCode? location = null, [FromQuery] bool availableOnly = false)
        {
            try
            {
                var result = await _vehicleService.GetVehiclesAsync(category, location, availableOnly);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve vehicles: {Error}", result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} vehicles", result.Value.Count);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get vehicle details by ID
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet("{vehicleId}")]
        public async Task<ActionResult<Vehicle>> GetVehicleById(string vehicleId)
        {
            if (string.IsNullOrEmpty(vehicleId))
            {
                return BadRequest("Vehicle ID is required");
            }

            try
            {
                var result = await _vehicleService.GetVehicleByIdAsync(vehicleId);

                if (result.HasError)
                {
                    _logger.LogWarning("Vehicle not found: {VehicleId}", vehicleId);
                    return NotFound(new { error = result.Error });
                }

                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicle: {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get vehicles by location
        /// </summary>
        [HttpGet("location/{location}")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesByLocation(LocationCode location)
        {
            try
            {
                var result = await _vehicleService.GetVehiclesByLocationAsync(location);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve vehicles by location {Location}: {Error}", location, result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} vehicles for location {Location}", result.Value.Count(), location);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicles by location: {Location}", location);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get vehicles by category
        /// </summary>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesByCategory(VehicleCategory category)
        {
            try
            {
                var result = await _vehicleService.GetVehiclesByCategoryAsync(category);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve vehicles by category {Category}: {Error}", category, result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} vehicles for category {Category}", result.Value.Count(), category);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vehicles by category: {Category}", category);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Search vehicles with advanced filters
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> SearchVehicles(
            [FromQuery] LocationCode? location = null,
            [FromQuery] VehicleCategory? category = null,
            [FromQuery] FuelType? fuelType = null,
            [FromQuery] TransmissionType? transmission = null,
            [FromQuery] int? minSeating = null,
            [FromQuery] decimal? maxDailyRate = null,
            [FromQuery] DateTime? availableFrom = null,
            [FromQuery] DateTime? availableTo = null)
        {
            try
            {
                var result = await _vehicleService.SearchVehiclesAsync(location, category, fuelType,
                    transmission, minSeating, maxDailyRate, availableFrom, availableTo);

                if (result.HasError)
                {
                    _logger.LogError("Vehicle search failed: {Error}", result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Vehicle search returned {Count} results", result.Value.Count());
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during vehicle search");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Update vehicle information
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut("{vehicleId}")]
        public async Task<IActionResult> UpdateVehicle(string vehicleId, [FromBody] Vehicle vehicle)
        {
            if (string.IsNullOrEmpty(vehicleId) || vehicle == null)
            {
                return BadRequest("Invalid vehicle data");
            }

            if (vehicleId != vehicle.VehicleId)
            {
                return BadRequest("Vehicle ID mismatch");
            }

            try
            {
                var result = await _vehicleService.UpdateVehicleAsync(vehicle);

                if (result.HasError)
                {
                    _logger.LogError("Failed to update vehicle {VehicleId}: {Error}", vehicleId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Vehicle updated successfully: {VehicleId}", vehicleId);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle: {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Delete vehicle from fleet
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpDelete("{vehicleId}")]
        public async Task<IActionResult> DeleteVehicle(string vehicleId)
        {
            if (string.IsNullOrEmpty(vehicleId))
            {
                return BadRequest("Vehicle ID is required");
            }

            try
            {
                var result = await _vehicleService.DeleteVehicleAsync(vehicleId);

                if (result.HasError)
                {
                    _logger.LogError("Failed to delete vehicle {VehicleId}: {Error}", vehicleId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Vehicle deleted successfully: {VehicleId}", vehicleId);
                return Ok("Vehicle deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle: {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Update vehicle availability status
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut("{vehicleId}/availability")]
        public async Task<IActionResult> UpdateVehicleAvailability(string vehicleId, [FromBody] bool isAvailable)
        {
            if (string.IsNullOrEmpty(vehicleId))
            {
                return BadRequest("Vehicle ID is required");
            }

            try
            {
                var result = await _vehicleService.UpdateVehicleAvailabilityAsync(vehicleId, isAvailable);

                if (result.HasError)
                {
                    _logger.LogError("Failed to update vehicle availability {VehicleId}: {Error}", vehicleId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Vehicle availability updated: {VehicleId} - Available: {IsAvailable}", vehicleId, isAvailable);
                return Ok("Vehicle availability updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle availability: {VehicleId}", vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}