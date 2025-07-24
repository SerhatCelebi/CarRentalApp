using DriveZone.Server.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class CreateUpdateBookingDTO
    {
        [Required(ErrorMessage = "Araç seçimi gereklidir")]
        public string VehicleId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Teslim alma tarihi gereklidir")]
        [DataType(DataType.DateTime)]
        public DateTime PickupDateTime { get; set; }

        [Required(ErrorMessage = "Teslim etme tarihi gereklidir")]
        [DataType(DataType.DateTime)]
        public DateTime ReturnDateTime { get; set; }

        public InsuranceType? InsuranceType { get; set; }

        [MaxLength(500, ErrorMessage = "Özel istekler çok uzun")]
        public string? SpecialRequests { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Geçersiz loyalty points")]
        public int LoyaltyPointsToUse { get; set; } = 0;

        public bool AcceptTermsAndConditions { get; set; } = false;

        // Helper validation methods
        public bool IsValidDateRange()
        {
            return PickupDateTime < ReturnDateTime &&
                   PickupDateTime > DateTime.Now.AddHours(1);
        }

        public int GetDurationInDays()
        {
            return (ReturnDateTime - PickupDateTime).Days;
        }

        public bool IsValidDuration()
        {
            var days = GetDurationInDays();
            return days >= 1 && days <= 30; // Min 1 day, max 30 days
        }
    }
}