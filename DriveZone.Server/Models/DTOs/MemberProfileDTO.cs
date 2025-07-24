using DriveZone.Server.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class MemberProfileDTO
    {
        public string MemberId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;

        public DateTime BirthDate { get; set; }
        public MembershipTier MembershipLevel { get; set; }
        public bool IsVipMember { get; set; }
        public int LoyaltyPoints { get; set; }
        public decimal TotalSpent { get; set; }

        public string NationalIdNumber { get; set; } = string.Empty;
        public string DriverLicenseNumber { get; set; } = string.Empty;
        public DateTime DriverLicenseExpiry { get; set; }
        public string DriverLicenseCountry { get; set; } = string.Empty;

        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? PreferredLanguage { get; set; }
        public string? PreferredCurrency { get; set; }

        public bool IsActive { get; set; }
        public bool IsProfileComplete { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime CreatedAt { get; set; }

        // Helper properties
        public string FullName => $"{FirstName} {LastName}";
        public int Age => DateTime.Now.Year - BirthDate.Year;
        public bool IsDriverLicenseValid => DriverLicenseExpiry > DateTime.Now.AddDays(30);
        public string MembershipTierDisplay => MembershipLevel.ToString();
    }

    public class UpdateMemberProfileDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullAddress { get; set; }
        public string ZipCode { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PhoneNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? PreferredLanguage { get; set; }
        public string? PreferredCurrency { get; set; }
        public bool EmailNotifications { get; set; }
        public bool SmsNotifications { get; set; }
    }
}