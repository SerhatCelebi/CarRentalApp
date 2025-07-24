using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models
{
    public class VehicleMaintenanceRecord
    {
        [Key]
        public string RecordId { get; set; } = string.Empty;

        [Required]
        public string VehicleId { get; set; } = string.Empty;

        [Required]
        public DateTime MaintenanceDate { get; set; }

        [Required]
        [MaxLength(100)]
        public string MaintenanceType { get; set; } = string.Empty; // Oil Change, Tire Replacement, etc.

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Cost { get; set; }

        [MaxLength(100)]
        public string? ServiceProvider { get; set; } // Garage/Service center name

        [Range(0, double.MaxValue)]
        public decimal? MileageAtService { get; set; }

        public DateTime? NextServiceDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? NextServiceMileage { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Completed"; // Scheduled, InProgress, Completed

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool IsWarrantyWork { get; set; } = false;

        [MaxLength(100)]
        public string? WarrantyReference { get; set; }

        public List<string>? ReplacedParts { get; set; } = new();

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }

        // Navigation property
        public virtual Vehicle? Vehicle { get; set; }

        // Helper methods
        public bool IsRoutineMaintenance()
        {
            var routineTypes = new[] { "Oil Change", "Tire Rotation", "Air Filter", "Brake Inspection" };
            return routineTypes.Contains(MaintenanceType);
        }

        public int DaysUntilNextService()
        {
            if (!NextServiceDate.HasValue) return -1;
            return Math.Max(0, (NextServiceDate.Value - DateTime.Now).Days);
        }

        public bool IsOverdue()
        {
            return NextServiceDate.HasValue && NextServiceDate.Value < DateTime.Now;
        }
    }
}