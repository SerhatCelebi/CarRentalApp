using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;

namespace DriveZone.Server.Data.Repositories.IRepositories
{
    public interface IBookingRepository
    {
        Task<Booking?> CreateBookingAsync(Booking booking);
        Task<List<Booking>> GetBookingsAsync(string? memberId = null, BookingStatus? status = null, int page = 1, int pageSize = 10);
        Task<Booking?> GetBookingByIdAsync(string bookingId);
        Task<Booking?> GetBookingByReferenceAsync(string bookingReference);
        Task<List<Booking>> GetMemberBookingsAsync(string memberId);
        Task<bool> UpdateBookingAsync(Booking booking);
        Task<bool> CancelBookingAsync(string bookingId, string? cancellationReason = null);
        Task<bool> UpdateBookingStatusAsync(string bookingId, BookingStatus status);
        Task<BookingStatisticsDTO> GetBookingStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate, LocationCode? location = null, VehicleCategory? category = null);
    }
}