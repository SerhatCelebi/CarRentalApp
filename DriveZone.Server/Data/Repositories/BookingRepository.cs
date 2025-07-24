using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Data.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DriveZone.Server.Data.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly DriveZoneContext _context;
        private readonly ILogger<BookingRepository> _logger;

        public BookingRepository(DriveZoneContext context, ILogger<BookingRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Booking?> CreateBookingAsync(Booking booking)
        {
            try
            {
                booking.BookingId = Guid.NewGuid().ToString();
                booking.BookingReference = await GenerateBookingReferenceAsync();
                booking.CreatedAt = DateTime.UtcNow;
                booking.Status = BookingStatus.Pending;

                _context.Bookings.Add(booking);
                var result = await _context.SaveChangesAsync();

                return result > 0 ? booking : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking");
                return null;
            }
        }

        public async Task<List<Booking>> GetBookingsAsync(string? memberId = null, BookingStatus? status = null, int page = 1, int pageSize = 10)
        {
            try
            {
                var query = _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(memberId))
                    query = query.Where(b => b.MemberId == memberId);

                if (status.HasValue)
                    query = query.Where(b => b.Status == status.Value);

                return await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings");
                return new List<Booking>();
            }
        }

        public async Task<Booking?> GetBookingByIdAsync(string bookingId)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking by ID: {BookingId}", bookingId);
                return null;
            }
        }

        public async Task<Booking?> GetBookingByReferenceAsync(string bookingReference)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .FirstOrDefaultAsync(b => b.BookingReference == bookingReference);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking by reference: {BookingReference}", bookingReference);
                return null;
            }
        }

        public async Task<List<Booking>> GetMemberBookingsAsync(string memberId)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Where(b => b.MemberId == memberId)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member bookings: {MemberId}", memberId);
                return new List<Booking>();
            }
        }

        public async Task<bool> UpdateBookingAsync(Booking booking)
        {
            try
            {
                booking.UpdatedAt = DateTime.UtcNow;
                _context.Bookings.Update(booking);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking: {BookingId}", booking.BookingId);
                return false;
            }
        }

        public async Task<bool> CancelBookingAsync(string bookingId, string? cancellationReason = null)
        {
            try
            {
                var booking = await GetBookingByIdAsync(bookingId);
                if (booking == null) return false;

                booking.Status = BookingStatus.Cancelled;
                booking.CancellationReason = cancellationReason;
                booking.CancelledAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;

                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking: {BookingId}", bookingId);
                return false;
            }
        }

        public async Task<bool> UpdateBookingStatusAsync(string bookingId, BookingStatus status)
        {
            try
            {
                var booking = await GetBookingByIdAsync(bookingId);
                if (booking == null) return false;

                booking.Status = status;
                booking.UpdatedAt = DateTime.UtcNow;

                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking status: {BookingId}", bookingId);
                return false;
            }
        }

        public async Task<BookingStatisticsDTO> GetBookingStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.Bookings.AsQueryable();

                if (fromDate.HasValue)
                    query = query.Where(b => b.CreatedAt >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(b => b.CreatedAt <= toDate.Value);

                var totalBookings = await query.CountAsync();
                var activeBookings = await query.CountAsync(b => b.Status == BookingStatus.Active);
                var completedBookings = await query.CountAsync(b => b.Status == BookingStatus.Completed);
                var cancelledBookings = await query.CountAsync(b => b.Status == BookingStatus.Cancelled);
                var totalRevenue = await query.Where(b => b.Status == BookingStatus.Completed).SumAsync(b => b.TotalAmount);

                return new BookingStatisticsDTO
                {
                    TotalBookings = totalBookings,
                    ActiveBookings = activeBookings,
                    CompletedBookings = completedBookings,
                    CancelledBookings = cancelledBookings,
                    TotalRevenue = totalRevenue,
                    AverageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking statistics");
                return new BookingStatisticsDTO();
            }
        }

        public async Task<List<Booking>> GetBookingsByStatusAsync(BookingStatus status)
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .Where(b => b.Status == status)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings by status: {Status}", status);
                return new List<Booking>();
            }
        }

        public async Task<List<Booking>> GetUpcomingBookingsAsync()
        {
            try
            {
                var tomorrow = DateTime.UtcNow.AddDays(1);

                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .Where(b => b.Status == BookingStatus.Confirmed &&
                               b.BookingStartDate <= tomorrow &&
                               b.BookingStartDate >= DateTime.UtcNow)
                    .OrderBy(b => b.BookingStartDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming bookings");
                return new List<Booking>();
            }
        }

        public async Task<List<Booking>> GetOverdueBookingsAsync()
        {
            try
            {
                return await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Member)
                    .Where(b => b.Status == BookingStatus.Active &&
                               b.BookingEndDate < DateTime.UtcNow)
                    .OrderBy(b => b.BookingEndDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting overdue bookings");
                return new List<Booking>();
            }
        }

        public async Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync(DateTime startDate, DateTime endDate, LocationCode? location = null, VehicleCategory? category = null)
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

                if (location.HasValue)
                    query = query.Where(v => v.Location == location.Value);

                if (category.HasValue)
                    query = query.Where(v => v.Category == category.Value);

                return await query
                    .OrderBy(v => v.DailyRate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available vehicles for date range");
                return new List<Vehicle>();
            }
        }

        private async Task<string> GenerateBookingReferenceAsync()
        {
            string reference;
            bool exists;

            do
            {
                reference = $"BK{DateTime.Now:yyyyMM}{Random.Shared.Next(100000, 999999)}";
                exists = await _context.Bookings.AnyAsync(b => b.BookingReference == reference);
            }
            while (exists);

            return reference;
        }
    }
}