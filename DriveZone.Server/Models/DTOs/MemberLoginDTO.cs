using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class MemberLoginDTO
    {
        [Required(ErrorMessage = "Username or email is required")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; }

        public bool RememberMe { get; set; } = false;

        // Optional: Allow login with email or username
        public bool IsEmail => Username.Contains("@");
    }

    public class MemberLoginResponseDTO
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public MemberProfileDTO Member { get; set; }
        public string Message { get; set; } = "Login successful";
    }
}