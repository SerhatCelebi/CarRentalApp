using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Models.ResultModel;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly UserManager<Member> _userManager;
        private readonly SignInManager<Member> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IMemberService memberService,
            UserManager<Member> userManager,
            SignInManager<Member> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _memberService = memberService;
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Register a new member to DriveZone platform
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] MemberRegistrationDTO registrationDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Registration attempt with invalid model state");
                return BadRequest(ModelState);
            }

            if (registrationDto == null)
            {
                _logger.LogWarning("Registration attempt with null data");
                return BadRequest(new { error = "Invalid registration data" });
            }

            // Additional validation
            if (!registrationDto.IsMinimumAge())
            {
                return BadRequest(new { error = "Minimum age requirement (21) not met" });
            }

            if (!registrationDto.IsDriverLicenseValid())
            {
                return BadRequest(new { error = "Driver license must be valid for at least 3 more months" });
            }

            try
            {
                // Check if email already exists
                var existingUser = await _userManager.FindByEmailAsync(registrationDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { error = "Bu e-posta adresi zaten kullanımda" });
                }

                // Check if phone already exists
                var existingPhone = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.PhoneNumber == registrationDto.PhoneNumber);
                if (existingPhone != null)
                {
                    return BadRequest(new { error = "Bu telefon numarası zaten kullanımda" });
                }

                var response = await _memberService.RegisterMemberAsync(registrationDto);

                if (response == null)
                {
                    return StatusCode(500, new { error = "Registration failed. Please try again." });
                }

                if (response.HasError)
                {
                    _logger.LogError("Registration failed: {Error}", response.Error);
                    return BadRequest(new { error = response.Error });
                }

                _logger.LogInformation("New member registered successfully: {Email}", registrationDto.Email);

                // Generate JWT token for immediate login
                var token = await GenerateJwtToken(response.Value);

                return Ok(new
                {
                    success = true,
                    message = "Kayıt başarıyla tamamlandı",
                    member = response.Value,
                    token = token,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member registration");
                return StatusCode(500, new { error = "An unexpected error occurred during registration" });
            }
        }

        /// <summary>
        /// Login to DriveZone platform
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] MemberLoginDTO loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (loginDto == null)
            {
                return BadRequest(new { error = "Invalid login data" });
            }

            try
            {
                var response = await _memberService.LoginMemberAsync(loginDto);

                if (response == null)
                {
                    return StatusCode(500, new { error = "Login failed. Please try again." });
                }

                if (response.HasError)
                {
                    _logger.LogWarning("Login failed for {Email}: {Error}", loginDto.Email, response.Error);
                    return BadRequest(new { error = response.Error });
                }

                var member = response.Value;
                var token = await GenerateJwtToken(member);

                _logger.LogInformation("Member logged in successfully: {Email}", loginDto.Email);

                return Ok(new
                {
                    success = true,
                    message = "Giriş başarılı",
                    member = member,
                    token = token,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member login");
                return StatusCode(500, new { error = "An unexpected error occurred during login" });
            }
        }

        /// <summary>
        /// Logout from DriveZone platform
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _signInManager.SignOutAsync();
                _logger.LogInformation("Member logged out successfully");

                return Ok(new
                {
                    success = true,
                    message = "Çıkış başarılı"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { error = "An error occurred during logout" });
            }
        }

        /// <summary>
        /// Refresh JWT token
        /// </summary>
        [HttpPost("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { error = "Invalid token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    return BadRequest(new { error = "User not found" });
                }

                var token = await GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    token = token,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return StatusCode(500, new { error = "An error occurred while refreshing token" });
            }
        }

        /// <summary>
        /// Change member password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { error = "Invalid token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    return BadRequest(new { error = "User not found" });
                }

                var result = await _userManager.ChangePasswordAsync(user,
                    changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { error = errors });
                }

                _logger.LogInformation("Password changed successfully for user: {Email}", userEmail);

                return Ok(new
                {
                    success = true,
                    message = "Şifre başarıyla değiştirildi"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new { error = "An error occurred while changing password" });
            }
        }

        /// <summary>
        /// Request password reset
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist
                    return Ok(new
                    {
                        success = true,
                        message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi"
                    });
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                // In a real application, you would send an email with the reset link
                // For now, we'll just log it (remove in production)
                _logger.LogInformation("Password reset token for {Email}: {Token}",
                    forgotPasswordDto.Email, token);

                return Ok(new
                {
                    success = true,
                    message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
                    resetToken = token // Remove this in production
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot password request");
                return StatusCode(500, new { error = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Reset password with token
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
                if (user == null)
                {
                    return BadRequest(new { error = "Invalid reset request" });
                }

                var result = await _userManager.ResetPasswordAsync(user,
                    resetPasswordDto.Token, resetPasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { error = errors });
                }

                _logger.LogInformation("Password reset successfully for user: {Email}", resetPasswordDto.Email);

                return Ok(new
                {
                    success = true,
                    message = "Şifre başarıyla sıfırlandı"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, new { error = "An error occurred while resetting password" });
            }
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { error = "Invalid token" });
                }

                var user = await _userManager.FindByEmailAsync(userEmail);
                if (user == null)
                {
                    return BadRequest(new { error = "User not found" });
                }

                return Ok(new
                {
                    success = true,
                    profile = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile");
                return StatusCode(500, new { error = "An error occurred while getting profile" });
            }
        }

        private async Task<string> GenerateJwtToken(Member member)
        {
            var jwtSettings = _configuration.GetSection("JWT");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"] ?? "DriveZone-Default-Secret-Key-For-JWT-Token");

            var roles = await _userManager.GetRolesAsync(member);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, member.Id),
                new(ClaimTypes.Email, member.Email ?? ""),
                new(ClaimTypes.Name, $"{member.FirstName} {member.LastName}"),
                new("MembershipLevel", member.MembershipLevel?.ToString() ?? "Bronze"),
                new("LoyaltyPoints", member.LoyaltyPoints.ToString()),
                new("IsVip", member.IsVip.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtSettings["Issuer"] ?? "DriveZone",
                Audience = jwtSettings["Audience"] ?? "DriveZone-Users",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    // Additional DTOs for AuthController
    public class ChangePasswordDTO
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}