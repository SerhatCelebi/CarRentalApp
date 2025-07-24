namespace DriveZone.Server.Models.DTOs
{
    public class MemberStatisticsDTO
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int VipMembers { get; set; }
        public Dictionary<string, int> MembersByLevel { get; set; } = new();
        public decimal AverageSpending { get; set; }
        public int NewMembersThisMonth { get; set; }
        public double MemberRetentionRate { get; set; }
        public int MembersWithBookings { get; set; }
        public int MembersWithoutBookings { get; set; }
        public decimal TotalMemberSpending { get; set; }
        public int TotalLoyaltyPointsAwarded { get; set; }
        public Dictionary<string, int> MembersByLocation { get; set; } = new();
        public Dictionary<string, decimal> SpendingByMembershipLevel { get; set; } = new();
        public DateTime StatisticsGeneratedAt { get; set; } = DateTime.UtcNow;
    }
}