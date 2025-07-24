using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Models.ResultModel;
using DriveZone.Server.Services.IServices;
using DriveZone.Server.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace DriveZone.Server.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IMemberService _memberService;
        private readonly IEmailService _emailService;
        private readonly UserManager<Member> _userManager;
        private readonly ILogger<BookingService> _logger;

        public BookingService(
            IBookingRepository bookingRepository,
            IVehicleRepository vehicleRepository,
            IMemberRepository memberRepository,
            IMemberService memberService,
            IEmailService emailService,
            UserManager<Member> userManager,
            ILogger<BookingService> logger)
        {
            _bookingRepository = bookingRepository;
            _vehicleRepository = vehicleRepository;
            _memberRepository = memberRepository;
            _memberService = memberService;
            _emailService = emailService;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<ResultModel<Booking>> CreateBookingAsync(CreateUpdateBookingDTO bookingDto, ClaimsPrincipal user)
        {
            try
            {
                var member = await _userManager.GetUserAsync(user);
                if (member == null)
                {
                    return ResultModel<Booking>.Error("Member not found");
                }

                // Validate booking dates
                if (!bookingDto.IsValidDateRange())
                {
                    return ResultModel<Booking>.Error("Invalid booking date range");
                }

                // Check vehicle availability
                var vehicle = await _vehicleRepository.GetVehicleByIdAsync(bookingDto.VehicleId);
                if (vehicle == null || !vehicle.IsAvailable)
                {
                    return ResultModel<Booking>.Error("Vehicle not available");
                }

                // Calculate costs
                var days = bookingDto.GetDurationInDays();
                var baseAmount = vehicle.DailyRate * days;
                var taxAmount = baseAmount * 0.18m; // 18% KDV
                var insuranceCost = bookingDto.InsuranceType.HasValue ? CalculateInsuranceCost(bookingDto.InsuranceType.Value, baseAmount) : 0;
                var totalAmount = baseAmount + taxAmount + insuranceCost;

                var booking = new Booking
                {
                    VehicleId = bookingDto.VehicleId,
                    MemberId = member.MemberId,
                    BookingStartDate = bookingDto.PickupDateTime,
                    BookingEndDate = bookingDto.ReturnDateTime,
                    BaseAmount = baseAmount,
                    TaxAmount = taxAmount,
                    SecurityDeposit = vehicle.SecurityDeposit,
                    InsuranceType = bookingDto.InsuranceType,
                    InsuranceCost = insuranceCost,
                    TotalAmount = totalAmount,
                    SpecialRequests = bookingDto.SpecialRequests,
                    Status = BookingStatus.Pending,
                    PaymentStatus = PaymentStatus.Pending
                };

                var result = await _bookingRepository.CreateBookingAsync(booking);
                if (result == null)
                {
                    return ResultModel<Booking>.Error("Failed to create booking");
                }

                // Send confirmation email
                await _emailService.SendBookingConfirmationAsync(result.BookingId);

                _logger.LogInformation("Booking created successfully: {BookingId}", result.BookingId);
                return ResultModel<Booking>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking");
                return ResultModel<Booking>.Error("Failed to create booking");
            }
        }

        public async Task<ResultModel<IEnumerable<Booking>>> GetBookingsAsync(ClaimsPrincipal user, BookingStatus? status = null, int page = 1, int pageSize = 10)
        {
            try
            {
                var isAdmin = user.IsInRole("Admin");
                string? memberId = null;

                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null)
                    {
                        return ResultModel<IEnumerable<Booking>>.Error("Member not found");
                    }
                    memberId = member.MemberId;
                }

                var bookings = await _bookingRepository.GetBookingsAsync(memberId, status, page, pageSize);
                return ResultModel<IEnumerable<Booking>>.Success(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings");
                return ResultModel<IEnumerable<Booking>>.Error("Failed to retrieve bookings");
            }
        }

        public async Task<ResultModel<Booking>> GetBookingByIdAsync(string bookingId, ClaimsPrincipal user)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<Booking>.Error("Booking not found");
                }

                // Check authorization
                var isAdmin = user.IsInRole("Admin");
                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null || booking.MemberId != member.MemberId)
                    {
                        return ResultModel<Booking>.Error("Unauthorized access to booking");
                    }
                }

                return ResultModel<Booking>.Success(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking by ID: {BookingId}", bookingId);
                return ResultModel<Booking>.Error("Failed to retrieve booking");
            }
        }

        public async Task<ResultModel<IEnumerable<Booking>>> GetMemberBookingsAsync(string memberId, ClaimsPrincipal user)
        {
            try
            {
                // Check authorization
                var isAdmin = user.IsInRole("Admin");
                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null || member.MemberId != memberId)
                    {
                        return ResultModel<IEnumerable<Booking>>.Error("Unauthorized access");
                    }
                }

                var bookings = await _bookingRepository.GetMemberBookingsAsync(memberId);
                return ResultModel<IEnumerable<Booking>>.Success(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member bookings: {MemberId}", memberId);
                return ResultModel<IEnumerable<Booking>>.Error("Failed to retrieve member bookings");
            }
        }

        public async Task<ResultModel<Booking>> UpdateBookingAsync(string bookingId, CreateUpdateBookingDTO bookingDto, ClaimsPrincipal user)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<Booking>.Error("Booking not found");
                }

                // Check authorization
                var isAdmin = user.IsInRole("Admin");
                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null || booking.MemberId != member.MemberId)
                    {
                        return ResultModel<Booking>.Error("Unauthorized access");
                    }
                }

                // Check if booking can be updated
                if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
                {
                    return ResultModel<Booking>.Error("Booking cannot be updated in current status");
                }

                // Update booking fields
                booking.BookingStartDate = bookingDto.PickupDateTime;
                booking.BookingEndDate = bookingDto.ReturnDateTime;
                booking.SpecialRequests = bookingDto.SpecialRequests;
                booking.InsuranceType = bookingDto.InsuranceType;

                // Recalculate costs if needed
                var vehicle = await _vehicleRepository.GetVehicleByIdAsync(booking.VehicleId);
                if (vehicle != null)
                {
                    var days = bookingDto.GetDurationInDays();
                    booking.BaseAmount = vehicle.DailyRate * days;
                    booking.TaxAmount = booking.BaseAmount * 0.18m;
                    booking.InsuranceCost = bookingDto.InsuranceType.HasValue ? CalculateInsuranceCost(bookingDto.InsuranceType.Value, booking.BaseAmount) : 0;
                    booking.TotalAmount = booking.BaseAmount + booking.TaxAmount + booking.InsuranceCost;
                }

                var result = await _bookingRepository.UpdateBookingAsync(booking);
                if (!result)
                {
                    return ResultModel<Booking>.Error("Failed to update booking");
                }

                return ResultModel<Booking>.Success(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking: {BookingId}", bookingId);
                return ResultModel<Booking>.Error("Failed to update booking");
            }
        }

        public async Task<ResultModel<bool>> CancelBookingAsync(string bookingId, ClaimsPrincipal user, string? cancellationReason = null)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<bool>.Error("Booking not found");
                }

                // Check authorization
                var isAdmin = user.IsInRole("Admin");
                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null || booking.MemberId != member.MemberId)
                    {
                        return ResultModel<bool>.Error("Unauthorized access");
                    }
                }

                // Check if booking can be cancelled
                if (!booking.CanBeCancelled())
                {
                    return ResultModel<bool>.Error("Booking cannot be cancelled in current status");
                }

                var result = await _bookingRepository.CancelBookingAsync(bookingId, cancellationReason);
                if (!result)
                {
                    return ResultModel<bool>.Error("Failed to cancel booking");
                }

                // Send cancellation email
                await _emailService.SendBookingCancellationAsync(bookingId);

                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking: {BookingId}", bookingId);
                return ResultModel<bool>.Error("Failed to cancel booking");
            }
        }

        public async Task<ResultModel<bool>> UpdateBookingStatusAsync(string bookingId, BookingStatus status)
        {
            try
            {
                var result = await _bookingRepository.UpdateBookingStatusAsync(bookingId, status);
                if (!result)
                {
                    return ResultModel<bool>.Error("Failed to update booking status");
                }

                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking status: {BookingId}", bookingId);
                return ResultModel<bool>.Error("Failed to update booking status");
            }
        }

        public async Task<ResultModel<IEnumerable<Vehicle>>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate, LocationCode? location = null, VehicleCategory? category = null)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return ResultModel<IEnumerable<Vehicle>>.Error("Invalid date range");
                }

                if (startDate < DateTime.Now.Date)
                {
                    return ResultModel<IEnumerable<Vehicle>>.Error("Start date cannot be in the past");
                }

                var vehicles = await _bookingRepository.GetAvailableVehiclesAsync(startDate, endDate, location, category);
                return ResultModel<IEnumerable<Vehicle>>.Success(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available vehicles");
                return ResultModel<IEnumerable<Vehicle>>.Error("Failed to retrieve available vehicles");
            }
        }

        public async Task<ResultModel<decimal>> CalculateBookingCostAsync(BookingCostEstimateDTO estimateDto)
        {
            try
            {
                Models.Member? member = null;
                if (!string.IsNullOrEmpty(estimateDto.MemberId))
                {
                    member = await _memberRepository.GetMemberByMemberIdAsync(estimateDto.MemberId);
                }

                var vehicle = await _vehicleRepository.GetVehicleByIdAsync(estimateDto.VehicleId);
                if (vehicle == null)
                {
                    return ResultModel<decimal>.Error("Vehicle not found");
                }

                var costResult = await CalculateBookingCostInternalAsync(estimateDto, vehicle, member);
                if (costResult.HasError)
                {
                    return ResultModel<decimal>.Error(costResult.Error);
                }

                return ResultModel<decimal>.Success(costResult.Value.TotalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating booking cost");
                return ResultModel<decimal>.Error("Failed to calculate booking cost");
            }
        }

        public async Task<ResultModel<Booking>> ExtendBookingAsync(string bookingId, DateTime newEndDate, ClaimsPrincipal user)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<Booking>.Error("Booking not found");
                }

                // Check authorization
                var isAdmin = user.IsInRole("Admin");
                if (!isAdmin)
                {
                    var member = await _userManager.GetUserAsync(user);
                    if (member == null || booking.MemberId != member.MemberId)
                    {
                        return ResultModel<Booking>.Error("Unauthorized access");
                    }
                }

                // Validate new end date
                if (newEndDate <= booking.BookingEndDate)
                {
                    return ResultModel<Booking>.Error("New end date must be after current end date");
                }

                // Update booking
                var originalEndDate = booking.BookingEndDate;
                booking.BookingEndDate = newEndDate;

                // Recalculate costs
                var vehicle = await _vehicleRepository.GetVehicleByIdAsync(booking.VehicleId);
                if (vehicle != null)
                {
                    var totalDays = (booking.BookingEndDate - booking.BookingStartDate).Days;
                    booking.BaseAmount = vehicle.DailyRate * totalDays;
                    booking.TaxAmount = booking.BaseAmount * 0.18m;
                    booking.TotalAmount = booking.BaseAmount + booking.TaxAmount + booking.InsuranceCost;
                }

                var result = await _bookingRepository.UpdateBookingAsync(booking);
                if (!result)
                {
                    return ResultModel<Booking>.Error("Failed to extend booking");
                }

                return ResultModel<Booking>.Success(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extending booking: {BookingId}", bookingId);
                return ResultModel<Booking>.Error("Failed to extend booking");
            }
        }

        public async Task<ResultModel<bool>> CompleteBookingAsync(string bookingId, BookingCompletionDTO completionDto)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<bool>.Error("Booking not found");
                }

                if (booking.Status != BookingStatus.Active)
                {
                    return ResultModel<bool>.Error("Only active bookings can be completed");
                }

                // Update booking status
                booking.Status = BookingStatus.Completed;
                booking.UpdatedAt = DateTime.UtcNow;

                // Apply additional charges if any
                if (completionDto.AdditionalCharges > 0)
                {
                    booking.TotalAmount += completionDto.AdditionalCharges.Value;
                }

                if (completionDto.LateFee > 0)
                {
                    booking.TotalAmount += completionDto.LateFee.Value;
                }

                var result = await _bookingRepository.UpdateBookingAsync(booking);
                if (!result)
                {
                    return ResultModel<bool>.Error("Failed to complete booking");
                }

                // Award loyalty points to member
                if (booking.Member != null)
                {
                    var loyaltyPoints = (int)(booking.TotalAmount * 0.01m); // 1% as loyalty points
                    await _memberService.AddLoyaltyPointsAsync(booking.MemberId, loyaltyPoints);
                }

                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing booking: {BookingId}", bookingId);
                return ResultModel<bool>.Error("Failed to complete booking");
            }
        }

        public async Task<ResultModel<BookingStatisticsDTO>> GetBookingStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var statistics = await _bookingRepository.GetBookingStatisticsAsync(fromDate, toDate);
                return ResultModel<BookingStatisticsDTO>.Success(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking statistics");
                return ResultModel<BookingStatisticsDTO>.Error("Failed to retrieve booking statistics");
            }
        }

        public async Task<bool> SendBookingConfirmationAsync(string bookingId)
        {
            try
            {
                return await _emailService.SendBookingConfirmationAsync(bookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking confirmation: {BookingId}", bookingId);
                return false;
            }
        }

        public async Task<ResultModel<bool>> ProcessBookingPaymentAsync(string bookingId, PaymentDetailsDTO paymentDetails)
        {
            try
            {
                var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
                if (booking == null)
                {
                    return ResultModel<bool>.Error("Booking not found");
                }

                // TODO: Implement actual payment processing with payment gateway
                // For now, simulate successful payment
                booking.PaymentStatus = PaymentStatus.Paid;
                booking.Status = BookingStatus.Confirmed;

                var result = await _bookingRepository.UpdateBookingAsync(booking);
                if (!result)
                {
                    return ResultModel<bool>.Error("Failed to process payment");
                }

                return ResultModel<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing booking payment: {BookingId}", bookingId);
                return ResultModel<bool>.Error("Failed to process payment");
            }
        }

        // Helper methods
        private async Task<BookingCostResult> CalculateBookingCostInternalAsync(CreateUpdateBookingDTO bookingDto, Models.Member member)
        {
            var vehicle = await _vehicleRepository.GetVehicleByIdAsync(bookingDto.VehicleId);
            if (vehicle == null)
            {
                return new BookingCostResult { Error = "Vehicle not found" };
            }

            return await CalculateBookingCostInternalAsync(bookingDto, vehicle, member);
        }

        private async Task<BookingCostResult> CalculateBookingCostInternalAsync(BookingCostEstimateDTO estimateDto, Vehicle vehicle, Models.Member? member)
        {
            var duration = estimateDto.EndDate - estimateDto.StartDate;
            var days = Math.Max(1, (int)Math.Ceiling(duration.TotalDays));
            var hours = duration.TotalHours % 24;

            // Base cost calculation
            var baseAmount = (days * vehicle.DailyRate) + ((decimal)hours * vehicle.HourlyRate);

            // Apply member discount
            var memberDiscount = member?.MembershipLevel switch
            {
                "Silver" => 0.05m,  // 5%
                "Gold" => 0.10m,    // 10%
                "Platinum" => 0.15m, // 15%
                _ => 0m
            };

            var discountAmount = baseAmount * memberDiscount;
            var discountedAmount = baseAmount - discountAmount;

            // Insurance cost
            var insuranceCost = estimateDto.InsuranceType switch
            {
                InsuranceType.Basic => discountedAmount * 0.05m,
                InsuranceType.Premium => discountedAmount * 0.10m,
                InsuranceType.Comprehensive => discountedAmount * 0.15m,
                _ => 0m
            };

            // Tax calculation (18% VAT in Turkey)
            var taxableAmount = discountedAmount + insuranceCost;
            var taxAmount = taxableAmount * 0.18m;

            var totalAmount = taxableAmount + taxAmount;

            return new BookingCostResult
            {
                BaseAmount = baseAmount,
                DiscountAmount = discountAmount,
                InsuranceCost = insuranceCost,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount
            };
        }

        private static int CalculateLoyaltyPoints(decimal totalAmount, string membershipLevel)
        {
            var basePoints = (int)(totalAmount / 10); // 1 point per 10 TRY

            var multiplier = membershipLevel switch
            {
                "Silver" => 1.2,
                "Gold" => 1.5,
                "Platinum" => 2.0,
                _ => 1.0
            };

            return (int)(basePoints * multiplier);
        }

        private class BookingCostResult
        {
            public decimal BaseAmount { get; set; }
            public decimal DiscountAmount { get; set; }
            public decimal InsuranceCost { get; set; }
            public decimal TaxAmount { get; set; }
            public decimal TotalAmount { get; set; }
            public string? Error { get; set; }
            public bool HasError => !string.IsNullOrEmpty(Error);
        }

        private decimal CalculateInsuranceCost(InsuranceType insuranceType, decimal baseAmount)
        {
            return insuranceType switch
            {
                InsuranceType.Basic => baseAmount * 0.05m,      // 5%
                InsuranceType.Premium => baseAmount * 0.10m,   // 10%
                InsuranceType.Comprehensive => baseAmount * 0.15m, // 15%
                _ => 0
            };
        }
    }
}