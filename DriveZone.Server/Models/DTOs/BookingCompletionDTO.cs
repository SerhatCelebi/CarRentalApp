using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class BookingCompletionDTO
    {
        [Required]
        public DateTime ActualEndDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? ActualMileage { get; set; }

        [MaxLength(1000)]
        public string? CompletionNotes { get; set; }

        [Range(1, 5)]
        public int? CustomerRating { get; set; }

        [MaxLength(500)]
        public string? CustomerFeedback { get; set; }

        public bool HasDamage { get; set; } = false;

        [MaxLength(1000)]
        public string? DamageDescription { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? AdditionalCharges { get; set; }

        [MaxLength(500)]
        public string? AdditionalChargesReason { get; set; }

        public bool IsLateReturn { get; set; } = false;

        [Range(0, double.MaxValue)]
        public decimal? LateFee { get; set; }

        // Validation
        public bool IsValid()
        {
            if (ActualEndDate == default) return false;
            if (HasDamage && string.IsNullOrEmpty(DamageDescription)) return false;
            if (AdditionalCharges > 0 && string.IsNullOrEmpty(AdditionalChargesReason)) return false;

            return true;
        }
    }
}