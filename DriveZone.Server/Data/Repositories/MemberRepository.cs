using DriveZone.Server.Models;
using DriveZone.Server.Data.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace DriveZone.Server.Data.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly DriveZoneContext _context;
        private readonly ILogger<MemberRepository> _logger;

        public MemberRepository(DriveZoneContext context, ILogger<MemberRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Member?> GetMemberByMemberIdAsync(string memberId)
        {
            try
            {
                return await _context.Members
                    .Include(m => m.Bookings)
                    .FirstOrDefaultAsync(m => m.MemberId == memberId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member by ID: {MemberId}", memberId);
                return null;
            }
        }

        public async Task<List<Member>> GetAllMembersPagedAsync(int page, int pageSize)
        {
            try
            {
                return await _context.Members
                    .OrderByDescending(m => m.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting paged members");
                return new List<Member>();
            }
        }

        public async Task<int> GetMembersCountAsync()
        {
            try
            {
                return await _context.Members.CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting members count");
                return 0;
            }
        }

        public async Task<bool> UpdateMemberAsync(Member member)
        {
            try
            {
                member.UpdatedAt = DateTime.UtcNow;
                _context.Members.Update(member);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member: {MemberId}", member.MemberId);
                return false;
            }
        }

        public async Task<int> GetMemberBookingCountAsync(string userId)
        {
            try
            {
                return await _context.Bookings
                    .Where(b => b.MemberId == userId)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member booking count: {UserId}", userId);
                return 0;
            }
        }

        public async Task<List<Member>> GetVipMembersAsync()
        {
            try
            {
                return await _context.Members
                    .Where(m => m.IsVipMember)
                    .OrderByDescending(m => m.TotalSpent)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting VIP members");
                return new List<Member>();
            }
        }

        public async Task<List<Member>> GetMembersByLevelAsync(string membershipLevel)
        {
            try
            {
                return await _context.Members
                    .Where(m => m.MembershipLevel == membershipLevel)
                    .OrderByDescending(m => m.LoyaltyPoints)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting members by level: {Level}", membershipLevel);
                return new List<Member>();
            }
        }

        public async Task<List<Member>> GetTopSpendingMembersAsync(int count = 10)
        {
            try
            {
                return await _context.Members
                    .OrderByDescending(m => m.TotalSpent)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top spending members");
                return new List<Member>();
            }
        }

        public async Task<List<Member>> SearchMembersAsync(string searchTerm)
        {
            try
            {
                var lowerSearchTerm = searchTerm.ToLower();
                return await _context.Members
                    .Where(m => m.FirstName.ToLower().Contains(lowerSearchTerm) ||
                               m.LastName.ToLower().Contains(lowerSearchTerm) ||
                               m.Email!.ToLower().Contains(lowerSearchTerm) ||
                               m.MemberId.ToLower().Contains(lowerSearchTerm))
                    .OrderBy(m => m.FirstName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching members: {SearchTerm}", searchTerm);
                return new List<Member>();
            }
        }

        public async Task<MemberStatisticsDTO> GetMemberStatisticsAsync()
        {
            try
            {
                var totalMembers = await _context.Members.CountAsync();
                var activeMembers = await _context.Members
                    .Where(m => m.LastLoginDate >= DateTime.UtcNow.AddDays(-30))
                    .CountAsync();
                var vipMembers = await _context.Members
                    .Where(m => m.IsVipMember)
                    .CountAsync();

                var membersByLevel = await _context.Members
                    .GroupBy(m => m.MembershipLevel)
                    .Select(g => new { Level = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Level, x => x.Count);

                var averageSpending = await _context.Members
                    .AverageAsync(m => (double?)m.TotalSpent) ?? 0;

                var newMembersThisMonth = await _context.Members
                    .Where(m => m.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                    .CountAsync();

                var retentionRate = totalMembers > 0 ? (double)activeMembers / totalMembers * 100 : 0;

                return new MemberStatisticsDTO
                {
                    TotalMembers = totalMembers,
                    ActiveMembers = activeMembers,
                    VipMembers = vipMembers,
                    MembersByLevel = membersByLevel,
                    AverageSpending = (decimal)averageSpending,
                    NewMembersThisMonth = newMembersThisMonth,
                    MemberRetentionRate = retentionRate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member statistics");
                return new MemberStatisticsDTO();
            }
        }
    }
}