using DriveZone.Server.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class BookingCostEstimateDTO
    {
        [Required]
        public DateTime PickupDate { get; set; }

        [Required]
        public DateTime ReturnDate { get; set; }

        [Required]
        public string VehicleId { get; set; } = string.Empty;

        public InsuranceType? InsuranceType { get; set; }

        public bool IncludeTax { get; set; } = true;

        // Calculated fields
        public int DurationInDays { get; set; }
        public decimal DailyRate { get; set; }
        public decimal BaseAmount { get; set; }
        public decimal InsuranceCost { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal SecurityDeposit { get; set; }
        public decimal TotalAmount { get; set; }

        // Breakdown
        public decimal DiscountAmount { get; set; }
        public string? DiscountReason { get; set; }
        public decimal LoyaltyDiscount { get; set; }
        public int LoyaltyPointsUsed { get; set; }

        // Additional info
        public string Currency { get; set; } = "TRY";
        public DateTime EstimatedAt { get; set; } = DateTime.UtcNow;
        public bool IsValidEstimate => PickupDate < ReturnDate && !string.IsNullOrEmpty(VehicleId);
    }
}