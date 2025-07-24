using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly ILogger<BookingController> _logger;

        public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
        {
            _bookingService = bookingService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new booking for a vehicle
        /// </summary>
        [Authorize(Roles = "Admin,Member")]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateUpdateBookingDTO bookingDto)
        {
            if (bookingDto == null)
            {
                return BadRequest("Invalid booking data");
            }

            try
            {
                var result = await _bookingService.CreateBookingAsync(bookingDto, User);

                if (result.HasError)
                {
                    _logger.LogError("Failed to create booking: {Error}", result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("New booking created successfully: {BookingId}", result.Value.BookingId);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking");
                return StatusCode(500, new { error = "An unexpected error occurred while creating booking" });
            }
        }

        /// <summary>
        /// Get current member's own bookings
        /// </summary>
        [Authorize(Roles = "Admin,Member")]
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetMyBookings([FromQuery] BookingStatus? status = null,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _bookingService.GetBookingsAsync(User, status, page, pageSize);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve member's bookings: {Error}", result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} bookings for current member", result.Value.Count());
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member's bookings");
                return StatusCode(500, new { error = "An unexpected error occurred while retrieving bookings" });
            }
        }

        /// <summary>
        /// Get all bookings for admin, or user's own bookings for members
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings([FromQuery] BookingStatus? status = null,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _bookingService.GetBookingsAsync(User, status, page, pageSize);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve bookings: {Error}", result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} bookings", result.Value.Count());
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bookings");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get booking details by ID
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet("{bookingId}")]
        public async Task<ActionResult<Booking>> GetBookingById(string bookingId)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest("Booking ID is required");
            }

            try
            {
                var result = await _bookingService.GetBookingByIdAsync(bookingId, User);

                if (result.HasError)
                {
                    _logger.LogWarning("Booking not found: {BookingId}", bookingId);
                    return NotFound(new { error = result.Error });
                }

                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booking: {BookingId}", bookingId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get member's booking history
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetMemberBookings(string memberId)
        {
            if (string.IsNullOrEmpty(memberId))
            {
                return BadRequest("Member ID is required");
            }

            try
            {
                var result = await _bookingService.GetMemberBookingsAsync(memberId, User);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve member bookings {MemberId}: {Error}", memberId, result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} bookings for member {MemberId}", result.Value.Count(), memberId);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member bookings: {MemberId}", memberId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update booking information
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpPut("{bookingId}")]
        public async Task<IActionResult> UpdateBooking(string bookingId, [FromBody] CreateUpdateBookingDTO bookingDto)
        {
            if (string.IsNullOrEmpty(bookingId) || bookingDto == null)
            {
                return BadRequest("Invalid booking data");
            }

            try
            {
                var result = await _bookingService.UpdateBookingAsync(bookingId, bookingDto, User);

                if (result.HasError)
                {
                    _logger.LogError("Failed to update booking {BookingId}: {Error}", bookingId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Booking updated successfully: {BookingId}", bookingId);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking: {BookingId}", bookingId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Cancel a booking
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpPut("{bookingId}/cancel")]
        public async Task<IActionResult> CancelBooking(string bookingId, [FromBody] string? cancellationReason = null)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest("Booking ID is required");
            }

            try
            {
                var result = await _bookingService.CancelBookingAsync(bookingId, User, cancellationReason);

                if (result.HasError)
                {
                    _logger.LogError("Failed to cancel booking {BookingId}: {Error}", bookingId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Booking cancelled successfully: {BookingId}", bookingId);
                return Ok("Booking cancelled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking: {BookingId}", bookingId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Update booking status
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut("{bookingId}/status")]
        public async Task<IActionResult> UpdateBookingStatus(string bookingId, [FromBody] BookingStatus status)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest("Booking ID is required");
            }

            try
            {
                var result = await _bookingService.UpdateBookingStatusAsync(bookingId, status);

                if (result.HasError)
                {
                    _logger.LogError("Failed to update booking status {BookingId}: {Error}", bookingId, result.Error);
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Booking status updated: {BookingId} - Status: {Status}", bookingId, status);
                return Ok("Booking status updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking status: {BookingId}", bookingId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get available vehicles for booking in date range
        /// </summary>
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetAvailableVehicles(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] LocationCode? location = null,
            [FromQuery] VehicleCategory? category = null)
        {
            if (startDate >= endDate)
            {
                return BadRequest("Start date must be before end date");
            }

            if (startDate < DateTime.Now.Date)
            {
                return BadRequest("Start date cannot be in the past");
            }

            try
            {
                var result = await _bookingService.GetAvailableVehiclesAsync(startDate, endDate, location, category);

                if (result.HasError)
                {
                    _logger.LogError("Failed to retrieve available vehicles: {Error}", result.Error);
                    return NotFound(new { error = result.Error });
                }

                _logger.LogInformation("Retrieved {Count} available vehicles for date range {StartDate} - {EndDate}",
                    result.Value.Count(), startDate, endDate);
                return Ok(result.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available vehicles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Calculate booking cost estimate
        /// </summary>
        [HttpPost("estimate")]
        public async Task<ActionResult<decimal>> CalculateBookingCost([FromBody] BookingCostEstimateDTO estimateDto)
        {
            if (estimateDto == null)
            {
                return BadRequest("Invalid estimate data");
            }

            try
            {
                var result = await _bookingService.CalculateBookingCostAsync(estimateDto);

                if (result.HasError)
                {
                    _logger.LogError("Failed to calculate booking cost: {Error}", result.Error);
                    return BadRequest(new { error = result.Error });
                }

                return Ok(new
                {
                    estimatedCost = result.Value,
                    breakdown = result.CostBreakdown
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating booking cost");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}