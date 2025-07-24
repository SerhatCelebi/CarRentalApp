using DriveZone.Server.Models;

namespace DriveZone.Server.Data.Repositories.IRepositories
{
    public interface IMemberRepository
    {
        /// <summary>
        /// Get member by member ID (custom ID, not Identity user ID)
        /// </summary>
        Task<Member?> GetMemberByMemberIdAsync(string memberId);

        /// <summary>
        /// Get all members with pagination
        /// </summary>
        Task<List<Member>> GetAllMembersPagedAsync(int page, int pageSize);

        /// <summary>
        /// Get total members count
        /// </summary>
        Task<int> GetMembersCountAsync();

        /// <summary>
        /// Update member information
        /// </summary>
        Task<bool> UpdateMemberAsync(Member member);

        /// <summary>
        /// Get member's total booking count
        /// </summary>
        Task<int> GetMemberBookingCountAsync(string userId);

        /// <summary>
        /// Get VIP members
        /// </summary>
        Task<List<Member>> GetVipMembersAsync();

        /// <summary>
        /// Get members by membership level
        /// </summary>
        Task<List<Member>> GetMembersByLevelAsync(string membershipLevel);

        /// <summary>
        /// Get top members by spending
        /// </summary>
        Task<List<Member>> GetTopSpendingMembersAsync(int count = 10);

        /// <summary>
        /// Search members by name or email
        /// </summary>
        Task<List<Member>> SearchMembersAsync(string searchTerm);

        /// <summary>
        /// Get member statistics
        /// </summary>
        Task<MemberStatisticsDTO> GetMemberStatisticsAsync();
    }

    /// <summary>
    /// DTO for member statistics
    /// </summary>
    public class MemberStatisticsDTO
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int VipMembers { get; set; }
        public Dictionary<string, int> MembersByLevel { get; set; } = new();
        public decimal AverageSpending { get; set; }
        public int NewMembersThisMonth { get; set; }
        public double MemberRetentionRate { get; set; }
    }
}