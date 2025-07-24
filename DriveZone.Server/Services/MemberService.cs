using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Services.IServices;
using DriveZone.Server.Data.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DriveZone.Server.Services
{
    public class MemberService : IMemberService
    {
        private readonly UserManager<Member> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<Member> _signInManager;
        private readonly IMemberRepository _memberRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MemberService> _logger;

        public MemberService(
            UserManager<Member> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<Member> signInManager,
            IMemberRepository memberRepository,
            IConfiguration configuration,
            ILogger<MemberService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _memberRepository = memberRepository;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<MemberLoginResponseDTO?> RegisterMemberAsync(MemberRegistrationDTO registrationDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(registrationDto.Email);
                if (existingUser != null)
                {
                    return null;
                }

                var existingUsername = await _userManager.FindByNameAsync(registrationDto.Username);
                if (existingUsername != null)
                {
                    return null;
                }

                // Create new member
                var member = new Member
                {
                    MemberId = $"DZ{DateTime.Now:yyyyMMdd}{new Random().Next(1000, 9999)}",
                    UserName = registrationDto.Username,
                    Email = registrationDto.Email,
                    FirstName = registrationDto.FirstName,
                    LastName = registrationDto.LastName,
                    PhoneNumber = registrationDto.PhoneNumber,
                    BirthDate = registrationDto.BirthDate,
                    FullAddress = registrationDto.FullAddress,
                    ZipCode = registrationDto.ZipCode,
                    CityName = registrationDto.CityName,
                    LocationCode = registrationDto.LocationCode,
                    NationalIdNumber = registrationDto.NationalIdNumber,
                    DriverLicenseNumber = registrationDto.DriverLicenseNumber,
                    DriverLicenseExpiryDate = registrationDto.DriverLicenseExpiryDate,
                    MembershipLevel = "Bronze",
                    LoyaltyPoints = 0,
                    TotalSpent = 0,
                    IsVipMember = false,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(member, registrationDto.Password);
                if (!result.Succeeded)
                {
                    _logger.LogError("Member creation failed: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return null;
                }

                // Add to member role
                await _userManager.AddToRoleAsync(member, "member");

                // Generate JWT token
                var token = await GenerateJwtTokenAsync(member);

                return new MemberLoginResponseDTO
                {
                    Token = token,
                    MemberId = member.MemberId,
                    Email = member.Email!,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    MembershipLevel = member.MembershipLevel,
                    IsVipMember = member.IsVipMember,
                    LoyaltyPoints = member.LoyaltyPoints
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member registration");
                return null;
            }
        }

        public async Task<MemberLoginResponseDTO?> LoginMemberAsync(MemberLoginDTO loginDto)
        {
            try
            {
                Member? member;

                if (loginDto.IsEmail)
                {
                    member = await _userManager.FindByEmailAsync(loginDto.Username);
                }
                else
                {
                    member = await _userManager.FindByNameAsync(loginDto.Username);
                }

                if (member == null)
                {
                    return null;
                }

                var signInResult = await _signInManager.CheckPasswordSignInAsync(member, loginDto.Password, lockoutOnFailure: true);
                if (!signInResult.Succeeded)
                {
                    return null;
                }

                // Update last login
                member.LastLoginDate = DateTime.UtcNow;
                await _userManager.UpdateAsync(member);

                // Generate JWT token
                var token = await GenerateJwtTokenAsync(member);

                return new MemberLoginResponseDTO
                {
                    Token = token,
                    MemberId = member.MemberId,
                    Email = member.Email!,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    MembershipLevel = member.MembershipLevel,
                    IsVipMember = member.IsVipMember,
                    LoyaltyPoints = member.LoyaltyPoints,
                    LastLoginDate = member.LastLoginDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during member login");
                return null;
            }
        }

        public async Task<MemberProfileDTO?> GetMemberProfileAsync(ClaimsPrincipal user)
        {
            try
            {
                var member = await _userManager.GetUserAsync(user);
                if (member == null)
                {
                    return null;
                }

                return new MemberProfileDTO
                {
                    MemberId = member.MemberId,
                    Username = member.UserName!,
                    Email = member.Email!,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    PhoneNumber = member.PhoneNumber!,
                    BirthDate = member.BirthDate,
                    FullAddress = member.FullAddress,
                    ZipCode = member.ZipCode,
                    CityName = member.CityName,
                    LocationCode = member.LocationCode,
                    MembershipLevel = member.MembershipLevel,
                    LoyaltyPoints = member.LoyaltyPoints,
                    TotalSpent = member.TotalSpent,
                    IsVipMember = member.IsVipMember,
                    CreatedAt = member.CreatedAt,
                    LastLoginDate = member.LastLoginDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member profile");
                return null;
            }
        }

        public async Task<bool> UpdateMemberProfileAsync(ClaimsPrincipal user, UpdateMemberProfileDTO updateDto)
        {
            try
            {
                var member = await _userManager.GetUserAsync(user);
                if (member == null)
                {
                    return false;
                }

                // Update member properties
                member.FirstName = updateDto.FirstName;
                member.LastName = updateDto.LastName;
                member.PhoneNumber = updateDto.PhoneNumber;
                member.FullAddress = updateDto.FullAddress;
                member.ZipCode = updateDto.ZipCode;
                member.CityName = updateDto.CityName;
                member.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(member);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member profile");
                return false;
            }
        }

        public async Task<MemberLoyaltyDTO?> GetMemberLoyaltyAsync(ClaimsPrincipal user)
        {
            try
            {
                var member = await _userManager.GetUserAsync(user);
                if (member == null)
                {
                    return null;
                }

                var totalBookings = await _memberRepository.GetMemberBookingCountAsync(member.Id);

                return new MemberLoyaltyDTO
                {
                    LoyaltyPoints = member.LoyaltyPoints,
                    MembershipLevel = member.MembershipLevel,
                    IsVipMember = member.IsVipMember,
                    TotalSpent = member.TotalSpent,
                    TotalBookings = totalBookings,
                    MemberSince = member.CreatedAt,
                    PointsToNextLevel = CalculatePointsToNextLevel(member.LoyaltyPoints, member.MembershipLevel)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member loyalty info");
                return null;
            }
        }

        public async Task<PagedResult<MemberProfileDTO>> GetAllMembersAsync(int page, int pageSize)
        {
            try
            {
                var members = await _memberRepository.GetAllMembersPagedAsync(page, pageSize);
                var totalCount = await _memberRepository.GetMembersCountAsync();

                var memberDtos = members.Select(m => new MemberProfileDTO
                {
                    MemberId = m.MemberId,
                    Username = m.UserName!,
                    Email = m.Email!,
                    FirstName = m.FirstName,
                    LastName = m.LastName,
                    MembershipLevel = m.MembershipLevel,
                    LoyaltyPoints = m.LoyaltyPoints,
                    TotalSpent = m.TotalSpent,
                    IsVipMember = m.IsVipMember,
                    CreatedAt = m.CreatedAt,
                    LastLoginDate = m.LastLoginDate
                }).ToList();

                return new PagedResult<MemberProfileDTO>
                {
                    Items = memberDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all members");
                return new PagedResult<MemberProfileDTO>();
            }
        }

        public async Task<bool> UpdateMemberStatusAsync(string memberId, UpdateMemberStatusDTO statusDto)
        {
            try
            {
                var member = await _memberRepository.GetMemberByMemberIdAsync(memberId);
                if (member == null)
                {
                    return false;
                }

                member.IsVipMember = statusDto.IsVipMember;
                member.MembershipLevel = statusDto.MembershipLevel;
                member.UpdatedAt = DateTime.UtcNow;

                return await _memberRepository.UpdateMemberAsync(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member status");
                return false;
            }
        }

        public async Task SeedRolesAsync()
        {
            try
            {
                var roles = new[] { "admin", "member" };

                foreach (var role in roles)
                {
                    if (!await _roleManager.RoleExistsAsync(role))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role));
                        _logger.LogInformation("Created role: {Role}", role);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding roles");
            }
        }

        public async Task<bool> AddLoyaltyPointsAsync(string memberId, int points)
        {
            try
            {
                var member = await _memberRepository.GetMemberByMemberIdAsync(memberId);
                if (member == null)
                {
                    return false;
                }

                member.LoyaltyPoints += points;

                // Check for membership level upgrade
                member.MembershipLevel = CalculateMembershipLevel(member.LoyaltyPoints);

                return await _memberRepository.UpdateMemberAsync(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding loyalty points");
                return false;
            }
        }

        public async Task<MemberStatisticsDTO> GetMemberStatisticsAsync()
        {
            try
            {
                return await _memberRepository.GetMemberStatisticsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member statistics");
                return new MemberStatisticsDTO();
            }
        }

        public async Task<bool> UpdateMemberSpentAsync(string memberId, decimal amount)
        {
            try
            {
                var member = await _memberRepository.GetMemberByMemberIdAsync(memberId);
                if (member == null)
                {
                    return false;
                }

                member.TotalSpent += amount;

                // Add loyalty points (1 point per 10 TRY spent)
                var loyaltyPointsEarned = (int)(amount / 10);
                member.LoyaltyPoints += loyaltyPointsEarned;

                // Check for membership level upgrade
                member.MembershipLevel = CalculateMembershipLevel(member.LoyaltyPoints);

                // Check for VIP eligibility
                if (!member.IsVipMember && member.TotalSpent >= 10000 && member.LoyaltyPoints >= 5000)
                {
                    member.IsVipMember = true;
                    member.VipExpiryDate = DateTime.UtcNow.AddYears(1);
                }

                return await _memberRepository.UpdateMemberAsync(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member spent amount");
                return false;
            }
        }

        public async Task<bool> CanMemberBookAsync(string memberId)
        {
            try
            {
                var member = await _memberRepository.GetMemberByMemberIdAsync(memberId);
                if (member == null || !member.IsActive)
                {
                    return false;
                }

                // Check age requirement (minimum 21)
                var age = DateTime.Now.Year - member.BirthDate.Year;
                if (DateTime.Now.DayOfYear < member.BirthDate.DayOfYear)
                    age--;

                if (age < 21)
                {
                    return false;
                }

                // Check driver license validity (must be valid for at least 30 days)
                if (member.DriverLicenseExpiry <= DateTime.Now.AddDays(30))
                {
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking member booking eligibility");
                return false;
            }
        }

        private async Task<string> GenerateJwtTokenAsync(Member member)
        {
            var roles = await _userManager.GetRolesAsync(member);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, member.Id),
                new(ClaimTypes.Name, member.UserName!),
                new(ClaimTypes.Email, member.Email!),
                new("MemberId", member.MemberId),
                new("MembershipLevel", member.MembershipLevel)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"] ?? "DriveZoneSecretKey2024!"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"] ?? "DriveZone",
                audience: _configuration["JWT:Audience"] ?? "DriveZoneUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static int CalculatePointsToNextLevel(int currentPoints, string currentLevel)
        {
            return currentLevel switch
            {
                "Bronze" => Math.Max(0, 2000 - currentPoints),
                "Silver" => Math.Max(0, 5000 - currentPoints),
                "Gold" => Math.Max(0, 10000 - currentPoints),
                "Platinum" => 0,
                _ => 2000
            };
        }

        private MembershipTier CalculateMembershipLevel(int loyaltyPoints)
        {
            return loyaltyPoints switch
            {
                >= 10000 => MembershipTier.Platinum,
                >= 5000 => MembershipTier.Gold,
                >= 2000 => MembershipTier.Silver,
                _ => MembershipTier.Bronze
            };
        }
    }
}