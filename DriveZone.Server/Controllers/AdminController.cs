using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly IVehicleService _vehicleService;
        private readonly IBookingService _bookingService;
        private readonly UserManager<Member> _userManager;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IMemberService memberService,
            IVehicleService vehicleService,
            IBookingService bookingService,
            UserManager<Member> userManager,
            ILogger<AdminController> logger)
        {
            _memberService = memberService;
            _vehicleService = vehicleService;
            _bookingService = bookingService;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Get comprehensive dashboard statistics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var memberStats = await _memberService.GetMemberStatisticsAsync();
                var vehicleStats = await _vehicleService.GetVehicleStatisticsAsync();
                var bookingStats = await _bookingService.GetBookingStatisticsAsync();

                var dashboardStats = new
                {
                    Members = memberStats,
                    Vehicles = vehicleStats,
                    Bookings = bookingStats,
                    Revenue = new
                    {
                        TotalRevenue = bookingStats.TotalRevenue,
                        MonthlyRevenue = bookingStats.MonthlyRevenue,
                        AverageBookingValue = bookingStats.AverageBookingValue,
                        RevenueGrowth = CalculateRevenueGrowth(bookingStats.MonthlyRevenue, bookingStats.PreviousMonthRevenue)
                    },
                    Overview = new
                    {
                        TotalMembers = memberStats.TotalMembers,
                        ActiveBookings = bookingStats.ActiveBookings,
                        AvailableVehicles = vehicleStats.AvailableVehicles,
                        VipMembers = memberStats.VipMembers
                    }
                };

                return Ok(dashboardStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard statistics");
                return StatusCode(500, new { error = "Failed to retrieve dashboard statistics" });
            }
        }

        /// <summary>
        /// Get all members with pagination and filtering
        /// </summary>
        [HttpGet("members")]
        public async Task<IActionResult> GetAllMembers(
            int page = 1,
            int limit = 20,
            string? search = null,
            string? membershipLevel = null,
            bool? isVip = null)
        {
            try
            {
                var members = await _memberService.GetAllMembersAsync(page, limit, search, membershipLevel, isVip);
                var totalCount = await _memberService.GetTotalMemberCountAsync();

                return Ok(new
                {
                    members,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalCount,
                        hasNext = page * limit < totalCount,
                        hasPrevious = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting members list");
                return StatusCode(500, new { error = "Failed to retrieve members" });
            }
        }

        /// <summary>
        /// Update member status (activate/deactivate/suspend)
        /// </summary>
        [HttpPut("members/{memberId}/status")]
        public async Task<IActionResult> UpdateMemberStatus(string memberId, [FromBody] UpdateMemberStatusDTO statusDto)
        {
            if (string.IsNullOrEmpty(memberId))
            {
                return BadRequest(new { error = "Member ID is required" });
            }

            try
            {
                var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var result = await _memberService.UpdateMemberStatusAsync(memberId, statusDto, adminEmail);

                if (result.HasError)
                {
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Member status updated by admin {Admin}: Member {MemberId} status changed to {Status}",
                    adminEmail, memberId, statusDto.Status);

                return Ok(new
                {
                    success = true,
                    message = "Member status updated successfully",
                    member = result.Value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member status for {MemberId}", memberId);
                return StatusCode(500, new { error = "Failed to update member status" });
            }
        }

        /// <summary>
        /// Get all vehicles with admin details
        /// </summary>
        [HttpGet("vehicles")]
        public async Task<IActionResult> GetAllVehicles(
            int page = 1,
            int limit = 20,
            string? category = null,
            string? status = null,
            bool? isActive = null)
        {
            try
            {
                var vehicles = await _vehicleService.GetAllVehiclesForAdminAsync(page, limit, category, status, isActive);
                var totalCount = await _vehicleService.GetTotalVehicleCountAsync();

                return Ok(new
                {
                    vehicles,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalCount,
                        hasNext = page * limit < totalCount,
                        hasPrevious = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles list for admin");
                return StatusCode(500, new { error = "Failed to retrieve vehicles" });
            }
        }

        /// <summary>
        /// Update vehicle status
        /// </summary>
        [HttpPut("vehicles/{vehicleId}/status")]
        public async Task<IActionResult> UpdateVehicleStatus(string vehicleId, [FromBody] UpdateVehicleStatusDTO statusDto)
        {
            if (string.IsNullOrEmpty(vehicleId))
            {
                return BadRequest(new { error = "Vehicle ID is required" });
            }

            try
            {
                var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var result = await _vehicleService.UpdateVehicleStatusAsync(vehicleId, statusDto, adminEmail);

                if (result.HasError)
                {
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Vehicle status updated by admin {Admin}: Vehicle {VehicleId} status changed to {Status}",
                    adminEmail, vehicleId, statusDto.Status);

                return Ok(new
                {
                    success = true,
                    message = "Vehicle status updated successfully",
                    vehicle = result.Value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle status for {VehicleId}", vehicleId);
                return StatusCode(500, new { error = "Failed to update vehicle status" });
            }
        }

        /// <summary>
        /// Get all bookings with admin view
        /// </summary>
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings(
            int page = 1,
            int limit = 20,
            string? status = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? memberId = null,
            string? vehicleId = null)
        {
            try
            {
                var bookings = await _bookingService.GetAllBookingsForAdminAsync(
                    page, limit, status, startDate, endDate, memberId, vehicleId);
                var totalCount = await _bookingService.GetTotalBookingCountAsync();

                return Ok(new
                {
                    bookings,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalCount,
                        hasNext = page * limit < totalCount,
                        hasPrevious = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings list for admin");
                return StatusCode(500, new { error = "Failed to retrieve bookings" });
            }
        }

        /// <summary>
        /// Approve or reject a booking
        /// </summary>
        [HttpPut("bookings/{bookingId}/approval")]
        public async Task<IActionResult> UpdateBookingApproval(string bookingId, [FromBody] BookingApprovalDTO approvalDto)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest(new { error = "Booking ID is required" });
            }

            try
            {
                var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var result = await _bookingService.UpdateBookingApprovalAsync(bookingId, approvalDto, adminEmail);

                if (result.HasError)
                {
                    return BadRequest(new { error = result.Error });
                }

                _logger.LogInformation("Booking approval updated by admin {Admin}: Booking {BookingId} {Action}",
                    adminEmail, bookingId, approvalDto.IsApproved ? "approved" : "rejected");

                return Ok(new
                {
                    success = true,
                    message = $"Booking {(approvalDto.IsApproved ? "approved" : "rejected")} successfully",
                    booking = result.Value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking approval for {BookingId}", bookingId);
                return StatusCode(500, new { error = "Failed to update booking approval" });
            }
        }

        /// <summary>
        /// Generate comprehensive reports
        /// </summary>
        [HttpGet("reports")]
        public async Task<IActionResult> GenerateReports(
            string reportType = "summary",
            DateTime? startDate = null,
            DateTime? endDate = null)
        {
            try
            {
                startDate ??= DateTime.UtcNow.AddMonths(-1);
                endDate ??= DateTime.UtcNow;

                var reports = reportType.ToLower() switch
                {
                    "revenue" => await GenerateRevenueReport(startDate.Value, endDate.Value),
                    "members" => await GenerateMemberReport(startDate.Value, endDate.Value),
                    "vehicles" => await GenerateVehicleReport(startDate.Value, endDate.Value),
                    "bookings" => await GenerateBookingReport(startDate.Value, endDate.Value),
                    _ => await GenerateSummaryReport(startDate.Value, endDate.Value)
                };

                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating {ReportType} report", reportType);
                return StatusCode(500, new { error = "Failed to generate report" });
            }
        }

        /// <summary>
        /// Export data to CSV
        /// </summary>
        [HttpGet("export/{dataType}")]
        public async Task<IActionResult> ExportData(string dataType, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                startDate ??= DateTime.UtcNow.AddMonths(-1);
                endDate ??= DateTime.UtcNow;

                var csvData = dataType.ToLower() switch
                {
                    "members" => await ExportMembersToCSV(startDate.Value, endDate.Value),
                    "vehicles" => await ExportVehiclesToCSV(),
                    "bookings" => await ExportBookingsToCSV(startDate.Value, endDate.Value),
                    _ => throw new ArgumentException("Invalid data type")
                };

                var fileName = $"DriveZone_{dataType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

                return File(Encoding.UTF8.GetBytes(csvData), "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting {DataType} data", dataType);
                return StatusCode(500, new { error = "Failed to export data" });
            }
        }

        #region Private Helper Methods

        private double CalculateRevenueGrowth(decimal currentRevenue, decimal previousRevenue)
        {
            if (previousRevenue == 0) return 0;
            return (double)((currentRevenue - previousRevenue) / previousRevenue * 100);
        }

        private async Task<object> GenerateSummaryReport(DateTime startDate, DateTime endDate)
        {
            var memberStats = await _memberService.GetMemberStatisticsAsync();
            var vehicleStats = await _vehicleService.GetVehicleStatisticsAsync();
            var bookingStats = await _bookingService.GetBookingStatisticsAsync();

            return new
            {
                ReportType = "Summary",
                Period = new { StartDate = startDate, EndDate = endDate },
                GeneratedAt = DateTime.UtcNow,
                Summary = new
                {
                    TotalMembers = memberStats.TotalMembers,
                    TotalVehicles = vehicleStats.TotalVehicles,
                    TotalBookings = bookingStats.TotalBookings,
                    TotalRevenue = bookingStats.TotalRevenue,
                    ActiveBookings = bookingStats.ActiveBookings,
                    VipMembers = memberStats.VipMembers
                },
                MemberStats = memberStats,
                VehicleStats = vehicleStats,
                BookingStats = bookingStats
            };
        }

        private async Task<object> GenerateRevenueReport(DateTime startDate, DateTime endDate)
        {
            var bookingStats = await _bookingService.GetBookingStatisticsAsync();
            // Implementation would include detailed revenue breakdown
            return new { ReportType = "Revenue", Period = new { StartDate = startDate, EndDate = endDate } };
        }

        private async Task<object> GenerateMemberReport(DateTime startDate, DateTime endDate)
        {
            var memberStats = await _memberService.GetMemberStatisticsAsync();
            // Implementation would include detailed member analysis
            return new { ReportType = "Members", Period = new { StartDate = startDate, EndDate = endDate } };
        }

        private async Task<object> GenerateVehicleReport(DateTime startDate, DateTime endDate)
        {
            var vehicleStats = await _vehicleService.GetVehicleStatisticsAsync();
            // Implementation would include detailed vehicle utilization
            return new { ReportType = "Vehicles", Period = new { StartDate = startDate, EndDate = endDate } };
        }

        private async Task<object> GenerateBookingReport(DateTime startDate, DateTime endDate)
        {
            var bookingStats = await _bookingService.GetBookingStatisticsAsync();
            // Implementation would include detailed booking analysis
            return new { ReportType = "Bookings", Period = new { StartDate = startDate, EndDate = endDate } };
        }

        private async Task<string> ExportMembersToCSV(DateTime startDate, DateTime endDate)
        {
            // Implementation would generate CSV content for members
            return "Member export CSV content";
        }

        private async Task<string> ExportVehiclesToCSV()
        {
            // Implementation would generate CSV content for vehicles
            return "Vehicle export CSV content";
        }

        private async Task<string> ExportBookingsToCSV(DateTime startDate, DateTime endDate)
        {
            // Implementation would generate CSV content for bookings
            return "Booking export CSV content";
        }

        #endregion
    }

    // Additional DTOs for AdminController
    public class UpdateVehicleStatusDTO
    {
        [Required]
        public string Status { get; set; } = string.Empty; // Available, Maintenance, OutOfService

        public string? Reason { get; set; }
    }

    public class BookingApprovalDTO
    {
        [Required]
        public bool IsApproved { get; set; }

        public string? Notes { get; set; }
    }
}