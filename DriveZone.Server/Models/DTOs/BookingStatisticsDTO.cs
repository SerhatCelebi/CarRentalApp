namespace DriveZone.Server.Models.DTOs
{
    public class BookingStatisticsDTO
    {
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int PendingBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal PreviousMonthRevenue { get; set; }
        public decimal AverageBookingValue { get; set; }
        public double AverageBookingDuration { get; set; }
        public int BookingsThisMonth { get; set; }
        public int BookingsToday { get; set; }
        public double BookingCompletionRate { get; set; }
        public double BookingCancellationRate { get; set; }
        public Dictionary<string, int> BookingsByStatus { get; set; } = new();
        public Dictionary<string, int> BookingsByVehicleCategory { get; set; } = new();
        public Dictionary<string, decimal> RevenueByMonth { get; set; } = new();
        public Dictionary<string, int> BookingsByHour { get; set; } = new();
        public Dictionary<string, int> BookingsByDayOfWeek { get; set; } = new();
        public List<PopularVehicleDTO> MostBookedVehicles { get; set; } = new();
        public DateTime StatisticsGeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class PopularVehicleDTO
    {
        public string VehicleId { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
    }
}