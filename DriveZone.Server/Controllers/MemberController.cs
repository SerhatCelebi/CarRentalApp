using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ILogger<MemberController> _logger;

        public MemberController(IMemberService memberService, ILogger<MemberController> logger)
        {
            _memberService = memberService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new member to DriveZone platform
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> RegisterMember([FromBody] MemberRegistrationDTO registrationDto)
        {
            if (registrationDto == null)
            {
                _logger.LogWarning("Registration attempt with null data");
                return BadRequest("Invalid registration data");
            }

            // Additional validation
            if (!registrationDto.IsMinimumAge())
            {
                return BadRequest("Minimum age requirement (21) not met");
            }

            if (!registrationDto.IsDriverLicenseValid())
            {
                return BadRequest("Driver license must be valid for at least 3 more months");
            }

            try
            {
                var response = await _memberService.RegisterMemberAsync(registrationDto);

                if (response == null)
                {
                    _logger.LogError("Member registration failed for username: {Username}", registrationDto.Username);
                    return BadRequest("Member registration failed");
                }

                _logger.LogInformation("New member registered successfully: {Username}", registrationDto.Username);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member registration for username: {Username}", registrationDto.Username);
                return StatusCode(500, "Internal server error during registration");
            }
        }

        /// <summary>
        /// Member login to DriveZone platform
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> LoginMember([FromBody] MemberLoginDTO loginDto)
        {
            if (loginDto == null)
            {
                _logger.LogWarning("Login attempt with null data");
                return BadRequest("Invalid login data");
            }

            try
            {
                var response = await _memberService.LoginMemberAsync(loginDto);

                if (response == null)
                {
                    _logger.LogWarning("Failed login attempt for username: {Username}", loginDto.Username);
                    return Unauthorized("Invalid credentials");
                }

                _logger.LogInformation("Member logged in successfully: {Username}", loginDto.Username);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member login for username: {Username}", loginDto.Username);
                return StatusCode(500, "Internal server error during login");
            }
        }

        /// <summary>
        /// Get current member profile information
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet("profile")]
        public async Task<ActionResult<MemberProfileDTO>> GetMemberProfile()
        {
            try
            {
                var profile = await _memberService.GetMemberProfileAsync(User);
                if (profile == null)
                {
                    _logger.LogWarning("Profile not found for user: {UserId}", User.Identity?.Name);
                    return NotFound("Member profile not found");
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member profile for user: {UserId}", User.Identity?.Name);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update member profile information
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMemberProfile([FromBody] UpdateMemberProfileDTO updateDto)
        {
            if (updateDto == null)
            {
                return BadRequest("Invalid update data");
            }

            try
            {
                var result = await _memberService.UpdateMemberProfileAsync(User, updateDto);
                if (!result)
                {
                    return BadRequest("Failed to update member profile");
                }

                _logger.LogInformation("Member profile updated successfully for user: {UserId}", User.Identity?.Name);
                return Ok("Profile updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member profile for user: {UserId}", User.Identity?.Name);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get member loyalty points and membership information
        /// </summary>
        [Authorize(Roles = "admin,member")]
        [HttpGet("loyalty")]
        public async Task<IActionResult> GetMemberLoyalty()
        {
            try
            {
                var loyaltyInfo = await _memberService.GetMemberLoyaltyAsync(User);
                if (loyaltyInfo == null)
                {
                    return NotFound("Member loyalty information not found");
                }

                return Ok(loyaltyInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member loyalty info for user: {UserId}", User.Identity?.Name);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Get all members with pagination
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllMembers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var members = await _memberService.GetAllMembersAsync(page, pageSize);
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all members");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Admin only: Update member status (VIP, Active/Inactive)
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut("{memberId}/status")]
        public async Task<IActionResult> UpdateMemberStatus(string memberId, [FromBody] UpdateMemberStatusDTO statusDto)
        {
            try
            {
                var result = await _memberService.UpdateMemberStatusAsync(memberId, statusDto);
                if (!result)
                {
                    return BadRequest("Failed to update member status");
                }

                _logger.LogInformation("Member status updated by admin for member: {MemberId}", memberId);
                return Ok("Member status updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member status for member: {MemberId}", memberId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}