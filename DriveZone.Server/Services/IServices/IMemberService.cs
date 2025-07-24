using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using System.Security.Claims;

namespace DriveZone.Server.Services.IServices
{
    public interface IMemberService
    {
        /// <summary>
        /// Register a new member to DriveZone platform
        /// </summary>
        Task<MemberLoginResponseDTO?> RegisterMemberAsync(MemberRegistrationDTO registrationDto);

        /// <summary>
        /// Login member to DriveZone platform
        /// </summary>
        Task<MemberLoginResponseDTO?> LoginMemberAsync(MemberLoginDTO loginDto);

        /// <summary>
        /// Get member profile information
        /// </summary>
        Task<MemberProfileDTO?> GetMemberProfileAsync(ClaimsPrincipal user);

        /// <summary>
        /// Update member profile information
        /// </summary>
        Task<bool> UpdateMemberProfileAsync(ClaimsPrincipal user, UpdateMemberProfileDTO updateDto);

        /// <summary>
        /// Get member loyalty points and membership information
        /// </summary>
        Task<MemberLoyaltyDTO?> GetMemberLoyaltyAsync(ClaimsPrincipal user);

        /// <summary>
        /// Admin only: Get all members with pagination
        /// </summary>
        Task<PagedResult<MemberProfileDTO>> GetAllMembersAsync(int page, int pageSize);

        /// <summary>
        /// Admin only: Update member status (VIP, Active/Inactive)
        /// </summary>
        Task<bool> UpdateMemberStatusAsync(string memberId, UpdateMemberStatusDTO statusDto);

        /// <summary>
        /// Seed roles for the application
        /// </summary>
        Task SeedRolesAsync();

        /// <summary>
        /// Add loyalty points to member
        /// </summary>
        Task<bool> AddLoyaltyPointsAsync(string memberId, int points);

        /// <summary>
        /// Get member statistics (admin only)
        /// </summary>
        Task<MemberStatisticsDTO> GetMemberStatisticsAsync();

        /// <summary>
        /// Update member total spent amount
        /// </summary>
        Task<bool> UpdateMemberSpentAsync(string memberId, decimal amount);

        /// <summary>
        /// Check if member can make bookings (age, license validity, etc.)
        /// </summary>
        Task<bool> CanMemberBookAsync(string memberId);

        /// <summary>
        /// Update member total spent amount
        /// </summary>
        Task<bool> UpdateMemberSpentAsync(string memberId, decimal amount);

        /// <summary>
        /// Check if member can make bookings (age, license validity, etc.)
        /// </summary>
        Task<bool> CanMemberBookAsync(string memberId);
    }

    /// <summary>
    /// DTO for member loyalty information
    /// </summary>
    public class MemberLoyaltyDTO
    {
        public int LoyaltyPoints { get; set; }
        public string MembershipLevel { get; set; } = string.Empty;
        public bool IsVipMember { get; set; }
        public decimal TotalSpent { get; set; }
        public int TotalBookings { get; set; }
        public DateTime MemberSince { get; set; }
        public int PointsToNextLevel { get; set; }
    }

    /// <summary>
    /// DTO for updating member status (admin only)
    /// </summary>
    public class UpdateMemberStatusDTO
    {
        public bool IsVipMember { get; set; }
        public string MembershipLevel { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? AdminNotes { get; set; }
    }

    /// <summary>
    /// Generic paged result wrapper
    /// </summary>
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}