using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using DriveZone.Server.Models.Enums;

namespace DriveZone.Server.Models
{
    public class Booking
    {
        [Key]
        public string BookingId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string BookingReference { get; set; } = GenerateBookingReference();

        [Required]
        public DateTime BookingStartDate { get; set; } // PickupDateTime -> BookingStartDate

        [Required]
        public DateTime BookingEndDate { get; set; } // ReturnDateTime -> BookingEndDate

        [Required]
        public decimal BaseAmount { get; set; } // Base rental cost

        [Required]
        public decimal TaxAmount { get; set; } // Tax calculation

        [Required]
        public decimal SecurityDeposit { get; set; } // Security deposit

        [Required]
        public decimal TotalAmount { get; set; } // Total cost including tax

        [Required]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Required]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public InsuranceType? InsuranceType { get; set; }
        public decimal InsuranceCost { get; set; }

        public string? SpecialRequests { get; set; }
        public string? CancellationReason { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        // Foreign Keys
        [ForeignKey("Vehicle")]
        public string VehicleId { get; set; } = string.Empty; // FK_CarId -> VehicleId

        [ForeignKey("Member")]
        public string MemberId { get; set; } = string.Empty; // FK_UserId -> MemberId

        // Navigation properties
        [JsonIgnore]
        public virtual Vehicle? Vehicle { get; set; }

        [JsonIgnore]
        public virtual Member? Member { get; set; }

        // Helper methods
        public int GetDurationInDays() => (BookingEndDate - BookingStartDate).Days;

        public decimal GetDailyRate() => GetDurationInDays() > 0 ? BaseAmount / GetDurationInDays() : 0;

        public bool IsActive() => Status == BookingStatus.Confirmed || Status == BookingStatus.Active;

        public bool CanBeCancelled() => Status == BookingStatus.Pending || Status == BookingStatus.Confirmed;

        public bool IsOverdue() => Status == BookingStatus.Active && BookingEndDate < DateTime.UtcNow;

        private static string GenerateBookingReference()
        {
            return $"BK{DateTime.Now:yyyyMM}{Random.Shared.Next(100000, 999999)}";
        }
    }
}