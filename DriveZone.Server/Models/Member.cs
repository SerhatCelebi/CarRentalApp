using System.ComponentModel.DataAnnotations;
using DriveZone.Server.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace DriveZone.Server.Models
{
    public class Member : IdentityUser
    {
        [Required]
        public string FirstName { get; set; } = string.Empty; // Firstname -> FirstName

        [Required]
        public string LastName { get; set; } = string.Empty; // Lastname -> LastName

        [Required]
        public string FullAddress { get; set; } = string.Empty; // Address -> FullAddress

        [Required]
        public string ZipCode { get; set; } = string.Empty; // PostalCode -> ZipCode

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string Country { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        public DateTime BirthDate { get; set; }

        // New Fields for DriveZone
        [Required]
        public string MemberId { get; set; } = GenerateMemberId();

        [Required]
        public MembershipTier MembershipLevel { get; set; } = MembershipTier.Bronze;

        [Required]
        public string NationalIdNumber { get; set; } = string.Empty; // For rental verification

        [Required]
        public string DriverLicenseNumber { get; set; } = string.Empty;

        [Required]
        public DateTime DriverLicenseExpiry { get; set; }

        [Required]
        public string DriverLicenseCountry { get; set; } = string.Empty;

        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }

        public string? PreferredLanguage { get; set; } = "tr-TR";
        public string? PreferredCurrency { get; set; } = "TRY";

        // Premium Member Benefits
        public bool IsVipMember { get; set; } = false;
        public int LoyaltyPoints { get; set; } = 0;
        public decimal TotalSpent { get; set; } = 0;
        public DateTime? VipExpiryDate { get; set; }

        // Account status
        public bool IsActive { get; set; } = true;
        public bool IsProfileComplete { get; set; } = false;
        public DateTime? LastLoginDate { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        // Helper methods
        public string GetFullName() => $"{FirstName} {LastName}";

        public bool IsEligibleForUpgrade() => TotalSpent >= 5000 && LoyaltyPoints >= 1000;

        public int GetAge() => DateTime.Now.Year - BirthDate.Year;

        public bool IsDriverLicenseValid() => DriverLicenseExpiry > DateTime.Now.AddDays(30);

        private static string GenerateMemberId()
        {
            return $"DZ{DateTime.Now:yyyyMM}{Random.Shared.Next(1000, 9999)}";
        }
    }
}