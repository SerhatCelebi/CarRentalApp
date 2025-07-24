using DriveZone.Server.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models
{
    public class Vehicle
    {
        [Key]
        public string VehicleId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Color { get; set; } = string.Empty;

        [Required]
        public int ManufactureYear { get; set; }

        [Required]
        public VehicleCategory Category { get; set; }

        [Required]
        public FuelType FuelType { get; set; }

        [Required]
        public TransmissionType Transmission { get; set; }

        [Required]
        [Range(1, 12)]
        public int SeatingCapacity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal DailyRate { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal HourlyRate { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal SecurityDeposit { get; set; }

        [Required]
        public LocationCode Location { get; set; }

        [Required]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Mileage { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? ImageUrl { get; set; }

        [Required]
        public bool IsAvailable { get; set; } = true;

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Additional premium features
        [MaxLength(100)]
        public string? VinNumber { get; set; }

        public int? EngineSize { get; set; } // in CC

        [Range(0, 500)]
        public int? HorsePower { get; set; }

        [Range(0, 50)]
        public decimal? FuelConsumption { get; set; } // L/100km

        public bool HasAirConditioning { get; set; } = true;
        public bool HasGPS { get; set; } = true;
        public bool HasBluetooth { get; set; } = true;
        public bool HasUSBCharging { get; set; } = true;
        public bool HasSunroof { get; set; } = false;
        public bool HasLeatherSeats { get; set; } = false;
        public bool HasParkingSensors { get; set; } = false;
        public bool HasBackupCamera { get; set; } = false;
        public bool HasCruiseControl { get; set; } = false;
        public bool HasKeylessEntry { get; set; } = false;

        // Insurance and safety
        public InsuranceType IncludedInsurance { get; set; } = InsuranceType.Basic;
        public bool HasABS { get; set; } = true;
        public bool HasAirbags { get; set; } = true;
        public int? SafetyRating { get; set; } // 1-5 stars

        // Maintenance
        public DateTime? LastMaintenanceDate { get; set; }
        public DateTime? NextMaintenanceDate { get; set; }
        public bool NeedsMaintenance { get; set; } = false;

        // Business logic
        public bool IsLuxury => Category == VehicleCategory.Luxury || Category == VehicleCategory.Sports;
        public bool IsEcoFriendly => FuelType == FuelType.Electric || FuelType == FuelType.Hybrid;
        public bool IsAutomatic => Transmission == TransmissionType.Automatic || Transmission == TransmissionType.CVT;

        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        // Helper methods
        public string GetDisplayName()
        {
            return $"{Make} {Model}";
        }

        public string GetFullDisplayName()
        {
            return $"{ManufactureYear} {Make} {Model}";
        }

        public decimal CalculateWeeklyRate()
        {
            return DailyRate * 7 * 0.9m; // 10% discount for weekly rentals
        }

        public decimal CalculateMonthlyRate()
        {
            return DailyRate * 30 * 0.8m; // 20% discount for monthly rentals
        }

        public bool IsAvailableForDates(DateTime startDate, DateTime endDate)
        {
            if (!IsAvailable) return false;

            return !Bookings.Any(b =>
                (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Active) &&
                ((b.BookingStartDate <= startDate && b.BookingEndDate > startDate) ||
                 (b.BookingStartDate < endDate && b.BookingEndDate >= endDate) ||
                 (b.BookingStartDate >= startDate && b.BookingEndDate <= endDate)));
        }

        public List<string> GetFeaturesList()
        {
            var features = new List<string>();

            if (HasAirConditioning) features.Add("Klima");
            if (HasGPS) features.Add("GPS");
            if (HasBluetooth) features.Add("Bluetooth");
            if (HasUSBCharging) features.Add("USB Şarj");
            if (HasSunroof) features.Add("Sunroof");
            if (HasLeatherSeats) features.Add("Deri Koltuk");
            if (HasParkingSensors) features.Add("Park Sensörü");
            if (HasBackupCamera) features.Add("Geri Görüş Kamerası");
            if (HasCruiseControl) features.Add("Hız Sabitleyici");
            if (HasKeylessEntry) features.Add("Anahtarsız Giriş");

            return features;
        }

        public string GetCategoryDisplayName()
        {
            return Category switch
            {
                VehicleCategory.Economy => "Ekonomi",
                VehicleCategory.Compact => "Kompakt",
                VehicleCategory.MidSize => "Orta Sınıf",
                VehicleCategory.FullSize => "Büyük Sınıf",
                VehicleCategory.Premium => "Premium",
                VehicleCategory.Luxury => "Lüks",
                VehicleCategory.SUV => "SUV",
                VehicleCategory.Van => "Van",
                VehicleCategory.Convertible => "Convertible",
                VehicleCategory.Sports => "Spor",
                VehicleCategory.Electric => "Elektrikli",
                _ => "Diğer"
            };
        }

        public string GetFuelTypeDisplayName()
        {
            return FuelType switch
            {
                FuelType.Gasoline => "Benzin",
                FuelType.Diesel => "Dizel",
                FuelType.Electric => "Elektrik",
                FuelType.Hybrid => "Hibrit",
                FuelType.PluginHybrid => "Plug-in Hibrit",
                _ => "Diğer"
            };
        }

        public string GetTransmissionDisplayName()
        {
            return Transmission switch
            {
                TransmissionType.Manual => "Manuel",
                TransmissionType.Automatic => "Otomatik",
                TransmissionType.CVT => "CVT",
                _ => "Diğer"
            };
        }
    }
}