namespace DriveZone.Server.Models.DTOs
{
    public class VehicleStatisticsDTO
    {
        public int TotalVehicles { get; set; }
        public int AvailableVehicles { get; set; }
        public int RentedVehicles { get; set; }
        public int MaintenanceVehicles { get; set; }
        public int OutOfServiceVehicles { get; set; }
        public Dictionary<string, int> VehiclesByCategory { get; set; } = new();
        public Dictionary<string, int> VehiclesByFuelType { get; set; } = new();
        public Dictionary<string, int> VehiclesByTransmission { get; set; } = new();
        public Dictionary<string, int> VehiclesByMake { get; set; } = new();
        public Dictionary<string, int> VehiclesByYear { get; set; } = new();
        public Dictionary<string, int> VehiclesByLocation { get; set; } = new();
        public double AverageVehicleAge { get; set; }
        public double VehicleUtilizationRate { get; set; }
        public decimal AverageDailyRate { get; set; }
        public decimal HighestDailyRate { get; set; }
        public decimal LowestDailyRate { get; set; }
        public int VehiclesAddedThisMonth { get; set; }
        public List<VehiclePerformanceDTO> TopPerformingVehicles { get; set; } = new();
        public List<VehicleMaintenanceDTO> VehiclesNeedingMaintenance { get; set; } = new();
        public DateTime StatisticsGeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class VehiclePerformanceDTO
    {
        public string VehicleId { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public double UtilizationRate { get; set; }
        public double AverageRating { get; set; }
    }

    public class VehicleMaintenanceDTO
    {
        public string VehicleId { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public DateTime? NextMaintenanceDate { get; set; }
        public decimal? NextMaintenanceMileage { get; set; }
        public int DaysUntilMaintenance { get; set; }
        public string MaintenanceType { get; set; } = string.Empty;
        public bool IsOverdue { get; set; }
    }
}