using System.ComponentModel.DataAnnotations;

namespace DriveZone.Server.Models.DTOs
{
    public class UpdateMemberStatusDTO
    {
        public bool? IsActive { get; set; }

        public bool? IsVipMember { get; set; }

        [MaxLength(20)]
        public string? MembershipLevel { get; set; }

        [Range(0, int.MaxValue)]
        public int? LoyaltyPoints { get; set; }

        [MaxLength(500)]
        public string? AdminNotes { get; set; }

        public string? UpdateReason { get; set; }
    }
}