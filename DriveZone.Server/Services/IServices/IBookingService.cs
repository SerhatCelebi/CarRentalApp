using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Models.ResultModel;
using System.Security.Claims;

namespace DriveZone.Server.Services.IServices
{
    public interface IBookingService
    {
        /// <summary>
        /// Create a new booking for a vehicle
        /// </summary>
        Task<ResultModel<Booking>> CreateBookingAsync(CreateUpdateBookingDTO bookingDto, ClaimsPrincipal user);

        /// <summary>
        /// Get bookings (admin gets all, members get their own)
        /// </summary>
        Task<ResultModel<IEnumerable<Booking>>> GetBookingsAsync(ClaimsPrincipal user, BookingStatus? status = null,
            int page = 1, int pageSize = 10);

        /// <summary>
        /// Get booking by ID
        /// </summary>
        Task<ResultModel<Booking>> GetBookingByIdAsync(string bookingId, ClaimsPrincipal user);

        /// <summary>
        /// Get member's booking history
        /// </summary>
        Task<ResultModel<IEnumerable<Booking>>> GetMemberBookingsAsync(string memberId, ClaimsPrincipal user);

        /// <summary>
        /// Update booking information
        /// </summary>
        Task<ResultModel<Booking>> UpdateBookingAsync(string bookingId, CreateUpdateBookingDTO bookingDto, ClaimsPrincipal user);

        /// <summary>
        /// Cancel a booking
        /// </summary>
        Task<ResultModel<bool>> CancelBookingAsync(string bookingId, ClaimsPrincipal user, string? cancellationReason = null);

        /// <summary>
        /// Update booking status (admin only)
        /// </summary>
        Task<ResultModel<bool>> UpdateBookingStatusAsync(string bookingId, BookingStatus status);

        /// <summary>
        /// Get available vehicles for booking in date range
        /// </summary>
        Task<ResultModel<IEnumerable<Vehicle>>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate,
            LocationCode? location = null, VehicleCategory? category = null);

        /// <summary>
        /// Calculate booking cost estimate
        /// </summary>
        Task<ResultModel<decimal>> CalculateBookingCostAsync(BookingCostEstimateDTO estimateDto);

        /// <summary>
        /// Extend booking duration
        /// </summary>
        Task<ResultModel<Booking>> ExtendBookingAsync(string bookingId, DateTime newEndDate, ClaimsPrincipal user);

        /// <summary>
        /// Complete booking (mark as completed)
        /// </summary>
        Task<ResultModel<bool>> CompleteBookingAsync(string bookingId, BookingCompletionDTO completionDto);

        /// <summary>
        /// Get booking statistics (admin only)
        /// </summary>
        Task<ResultModel<BookingStatisticsDTO>> GetBookingStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>
        /// Send booking confirmation email
        /// </summary>
        Task<bool> SendBookingConfirmationAsync(string bookingId);

        /// <summary>
        /// Process booking payment
        /// </summary>
        Task<ResultModel<bool>> ProcessBookingPaymentAsync(string bookingId, PaymentDetailsDTO paymentDetails);
    }

    /// <summary>
    /// DTO for booking cost estimation
    /// </summary>
    public class BookingCostEstimateDTO
    {
        public string VehicleId { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public InsuranceType InsuranceType { get; set; }
        public string? MemberId { get; set; }
        public string? PromoCode { get; set; }
    }

    /// <summary>
    /// DTO for booking completion
    /// </summary>
    public class BookingCompletionDTO
    {
        public decimal FinalMileage { get; set; }
        public string? DamageNotes { get; set; }
        public decimal AdditionalCharges { get; set; }
        public int RatingByMember { get; set; } // 1-5 stars
        public string? FeedbackComments { get; set; }
        public bool FuelTankFull { get; set; }
    }

    /// <summary>
    /// DTO for booking statistics
    /// </summary>
    public class BookingStatisticsDTO
    {
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageBookingValue { get; set; }
        public Dictionary<VehicleCategory, int> BookingsByCategory { get; set; } = new();
        public Dictionary<LocationCode, int> BookingsByLocation { get; set; } = new();
        public double AverageBookingDuration { get; set; }
        public int RepeatCustomers { get; set; }
    }

    /// <summary>
    /// DTO for payment details
    /// </summary>
    public class PaymentDetailsDTO
    {
        public string PaymentMethod { get; set; } = string.Empty; // Credit Card, PayPal, etc.
        public string CardNumber { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string ExpiryMonth { get; set; } = string.Empty;
        public string ExpiryYear { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "TRY";
    }
}