using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class MemberRegistrationDTO
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password confirmation is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
        public string FullAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Zip code is required")]
        [StringLength(10, ErrorMessage = "Zip code cannot exceed 10 characters")]
        public string ZipCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [StringLength(50, ErrorMessage = "City cannot exceed 50 characters")]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "Country is required")]
        [StringLength(50, ErrorMessage = "Country cannot exceed 50 characters")]
        public string Country { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Birth date is required")]
        [DataType(DataType.Date)]
        public DateTime BirthDate { get; set; }

        // New required fields for DriveZone
        [Required(ErrorMessage = "National ID number is required")]
        [StringLength(20, ErrorMessage = "National ID cannot exceed 20 characters")]
        public string NationalIdNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Driver license number is required")]
        [StringLength(30, ErrorMessage = "Driver license number cannot exceed 30 characters")]
        public string DriverLicenseNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Driver license expiry date is required")]
        [DataType(DataType.Date)]
        public DateTime DriverLicenseExpiry { get; set; }

        [Required(ErrorMessage = "Driver license country is required")]
        [StringLength(50, ErrorMessage = "Driver license country cannot exceed 50 characters")]
        public string DriverLicenseCountry { get; set; } = string.Empty;

        // Optional fields
        public string? EmergencyContactName { get; set; }

        [Phone(ErrorMessage = "Invalid emergency contact phone format")]
        public string? EmergencyContactPhone { get; set; }

        public string? PreferredLanguage { get; set; } = "tr-TR";
        public string? PreferredCurrency { get; set; } = "TRY";

        // Terms and conditions
        [Required(ErrorMessage = "You must accept the terms and conditions")]
        [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms and conditions")]
        public bool AcceptTerms { get; set; }

        [Required(ErrorMessage = "You must accept the privacy policy")]
        [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the privacy policy")]
        public bool AcceptPrivacyPolicy { get; set; }

        public bool SubscribeToNewsletter { get; set; } = false;

        // Validation helper methods
        public bool IsMinimumAge()
        {
            var age = DateTime.Now.Year - BirthDate.Year;
            if (DateTime.Now.DayOfYear < BirthDate.DayOfYear)
                age--;
            return age >= 21; // Minimum age requirement for car rental
        }

        public bool IsDriverLicenseValid()
        {
            return DriverLicenseExpiry > DateTime.Now.AddMonths(3); // License must be valid for at least 3 more months
        }

        public int GetAge()
        {
            var age = DateTime.Now.Year - BirthDate.Year;
            if (DateTime.Now.DayOfYear < BirthDate.DayOfYear)
                age--;
            return age;
        }

        public bool IsValidForRental()
        {
            return IsMinimumAge() && IsDriverLicenseValid();
        }
    }
}