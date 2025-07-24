using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DriveZone.Server.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(DriveZoneContext context, UserManager<Member> userManager, RoleManager<IdentityRole> roleManager)
        {
            await SeedRolesAsync(roleManager);
            await SeedAdminUserAsync(userManager);
            await SeedVehiclesAsync(context);
            await SeedMembersAsync(userManager);
            await SeedBookingsAsync(context);
            await SeedMaintenanceRecordsAsync(context);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            if (!await roleManager.RoleExistsAsync("Member"))
            {
                await roleManager.CreateAsync(new IdentityRole("Member"));
            }
        }

        private static async Task SeedAdminUserAsync(UserManager<Member> userManager)
        {
            var adminEmail = "admin@drivezone.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new Member
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "Admin",
                    LastName = "DriveZone",
                    PhoneNumber = "+90 555 123 4567",
                    Address = "DriveZone Merkez Ofis",
                    City = "İstanbul",
                    PostalCode = "34000",
                    Country = "TR",
                    BirthDate = new DateTime(1990, 1, 1),
                    MembershipLevel = MembershipLevel.Platinum,
                    LoyaltyPoints = 10000,
                    JoinDate = DateTime.UtcNow,
                    IsActive = true,
                    LicenseNumber = "ADMIN123456",
                    NationalId = "12345678901"
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }

        private static async Task SeedVehiclesAsync(DriveZoneContext context)
        {
            if (await context.Vehicles.AnyAsync())
                return;

            var vehicles = new List<Vehicle>
            {
                new Vehicle
                {
                    Make = "Toyota",
                    Model = "Corolla",
                    Year = 2023,
                    Color = "Beyaz",
                    Category = VehicleCategory.Sedan,
                    FuelType = FuelType.Hybrid,
                    Transmission = TransmissionType.Automatic,
                    SeatingCapacity = 5,
                    DailyRate = 180,
                    HourlyRate = 25,
                    SecurityDeposit = 800,
                    LicensePlate = "34 DZ 001",
                    Mileage = 5000,
                    Description = "Yakıt tasarruflu, konforlu sedan araç",
                    IsAvailable = true,
                    Location = "İstanbul",
                    HasAirConditioning = true,
                    HasGPS = true,
                    HasBluetooth = true,
                    HasBackupCamera = true,
                    HasSunroof = false,
                    HasLeatherSeats = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Vehicle
                {
                    Make = "BMW",
                    Model = "320i",
                    Year = 2023,
                    Color = "Siyah",
                    Category = VehicleCategory.Luxury,
                    FuelType = FuelType.Gasoline,
                    Transmission = TransmissionType.Automatic,
                    SeatingCapacity = 5,
                    DailyRate = 350,
                    HourlyRate = 50,
                    SecurityDeposit = 1500,
                    LicensePlate = "34 DZ 002",
                    Mileage = 2000,
                    Description = "Lüks sedan, premium deneyim",
                    IsAvailable = true,
                    Location = "İstanbul",
                    HasAirConditioning = true,
                    HasGPS = true,
                    HasBluetooth = true,
                    HasBackupCamera = true,
                    HasSunroof = true,
                    HasLeatherSeats = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Vehicle
                {
                    Make = "Volkswagen",
                    Model = "Transporter",
                    Year = 2022,
                    Color = "Gri",
                    Category = VehicleCategory.Van,
                    FuelType = FuelType.Diesel,
                    Transmission = TransmissionType.Manual,
                    SeatingCapacity = 9,
                    DailyRate = 250,
                    HourlyRate = 35,
                    SecurityDeposit = 1000,
                    LicensePlate = "34 DZ 003",
                    Mileage = 15000,
                    Description = "Geniş aile ve grup seyahatleri için ideal",
                    IsAvailable = true,
                    Location = "Ankara",
                    HasAirConditioning = true,
                    HasGPS = true,
                    HasBluetooth = true,
                    HasBackupCamera = false,
                    HasSunroof = false,
                    HasLeatherSeats = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Vehicle
                {
                    Make = "Mercedes-Benz",
                    Model = "C-Class",
                    Year = 2023,
                    Color = "Gümüş",
                    Category = VehicleCategory.Luxury,
                    FuelType = FuelType.Gasoline,
                    Transmission = TransmissionType.Automatic,
                    SeatingCapacity = 5,
                    DailyRate = 400,
                    HourlyRate = 60,
                    SecurityDeposit = 2000,
                    LicensePlate = "34 DZ 004",
                    Mileage = 1000,
                    Description = "Premium lüks sedan, iş toplantıları için mükemmel",
                    IsAvailable = true,
                    Location = "İstanbul",
                    HasAirConditioning = true,
                    HasGPS = true,
                    HasBluetooth = true,
                    HasBackupCamera = true,
                    HasSunroof = true,
                    HasLeatherSeats = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Vehicle
                {
                    Make = "Ford",
                    Model = "Focus",
                    Year = 2022,
                    Color = "Kırmızı",
                    Category = VehicleCategory.Hatchback,
                    FuelType = FuelType.Gasoline,
                    Transmission = TransmissionType.Manual,
                    SeatingCapacity = 5,
                    DailyRate = 150,
                    HourlyRate = 20,
                    SecurityDeposit = 600,
                    LicensePlate = "34 DZ 005",
                    Mileage = 25000,
                    Description = "Ekonomik ve pratik şehir aracı",
                    IsAvailable = true,
                    Location = "İzmir",
                    HasAirConditioning = true,
                    HasGPS = false,
                    HasBluetooth = true,
                    HasBackupCamera = false,
                    HasSunroof = false,
                    HasLeatherSeats = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Vehicles.AddRange(vehicles);
            await context.SaveChangesAsync();
        }

        private static async Task SeedMembersAsync(UserManager<Member> userManager)
        {
            var demoUsers = new List<(Member member, string password)>
            {
                (new Member
                {
                    UserName = "demo@drivezone.com",
                    Email = "demo@drivezone.com",
                    EmailConfirmed = true,
                    FirstName = "Demo",
                    LastName = "Kullanıcı",
                    PhoneNumber = "+90 555 987 6543",
                    Address = "Demo Adres, Şişli",
                    City = "İstanbul",
                    PostalCode = "34380",
                    Country = "TR",
                    BirthDate = new DateTime(1985, 5, 15),
                    MembershipLevel = MembershipLevel.Gold,
                    LoyaltyPoints = 2500,
                    JoinDate = DateTime.UtcNow.AddMonths(-6),
                    IsActive = true,
                    LicenseNumber = "DEMO123456",
                    NationalId = "98765432109"
                }, "Demo123!"),

                (new Member
                {
                    UserName = "test@drivezone.com",
                    Email = "test@drivezone.com",
                    EmailConfirmed = true,
                    FirstName = "Test",
                    LastName = "User",
                    PhoneNumber = "+90 555 111 2233",
                    Address = "Test Street, Kadıköy",
                    City = "İstanbul",
                    PostalCode = "34710",
                    Country = "TR",
                    BirthDate = new DateTime(1992, 8, 22),
                    MembershipLevel = MembershipLevel.Silver,
                    LoyaltyPoints = 1200,
                    JoinDate = DateTime.UtcNow.AddMonths(-3),
                    IsActive = true,
                    LicenseNumber = "TEST789012",
                    NationalId = "11223344556"
                }, "Test123!")
            };

            foreach (var (member, password) in demoUsers)
            {
                var existingUser = await userManager.FindByEmailAsync(member.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(member, password);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(member, "Member");
                    }
                }
            }
        }

        private static async Task SeedBookingsAsync(DriveZoneContext context)
        {
            if (await context.Bookings.AnyAsync())
                return;

            var vehicles = await context.Vehicles.Take(3).ToListAsync();
            var members = await context.Users.Where(u => u.Email.Contains("demo") || u.Email.Contains("test")).ToListAsync();

            if (vehicles.Any() && members.Any())
            {
                var bookings = new List<Booking>
                {
                    new Booking
                    {
                        VehicleId = vehicles[0].Id,
                        MemberId = members[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(2),
                        EndDate = DateTime.UtcNow.AddDays(5),
                        Status = BookingStatus.Confirmed,
                        TotalCost = 540, // 3 days * 180
                        SecurityDeposit = 800,
                        InsuranceType = InsuranceType.Basic,
                        SpecialRequests = "Havaalanı teslim alım",
                        CreatedAt = DateTime.UtcNow,
                        PickupLocation = "İstanbul Havalimanı",
                        DropoffLocation = "Taksim Meydanı"
                    },
                    new Booking
                    {
                        VehicleId = vehicles[1].Id,
                        MemberId = members.Count > 1 ? members[1].Id : members[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(-5),
                        EndDate = DateTime.UtcNow.AddDays(-2),
                        Status = BookingStatus.Completed,
                        TotalCost = 1050, // 3 days * 350
                        SecurityDeposit = 1500,
                        InsuranceType = InsuranceType.Premium,
                        SpecialRequests = "Tam dolu teslim",
                        CreatedAt = DateTime.UtcNow.AddDays(-7),
                        PickupLocation = "Levent Plaza",
                        DropoffLocation = "Levent Plaza",
                        ActualEndDate = DateTime.UtcNow.AddDays(-2),
                        ActualMileage = 2500,
                        CompletionNotes = "Sorunsuz teslim alındı"
                    }
                };

                context.Bookings.AddRange(bookings);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedMaintenanceRecordsAsync(DriveZoneContext context)
        {
            if (await context.VehicleMaintenanceRecords.AnyAsync())
                return;

            var vehicles = await context.Vehicles.Take(2).ToListAsync();

            if (vehicles.Any())
            {
                var maintenanceRecords = new List<VehicleMaintenanceRecord>
                {
                    new VehicleMaintenanceRecord
                    {
                        VehicleId = vehicles[0].Id,
                        MaintenanceType = "Periyodik Bakım",
                        Description = "5000 km periyodik bakım yapıldı",
                        MaintenanceDate = DateTime.UtcNow.AddDays(-30),
                        Cost = 350,
                        ServiceProvider = "Toyota Yetkili Servis",
                        Mileage = 5000,
                        NextMaintenanceDate = DateTime.UtcNow.AddDays(60),
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new VehicleMaintenanceRecord
                    {
                        VehicleId = vehicles[1].Id,
                        MaintenanceType = "Lastik Değişimi",
                        Description = "4 adet kış lastiği takıldı",
                        MaintenanceDate = DateTime.UtcNow.AddDays(-15),
                        Cost = 1200,
                        ServiceProvider = "BMW Yetkili Servis",
                        Mileage = 2000,
                        NextMaintenanceDate = DateTime.UtcNow.AddDays(180),
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    }
                };

                context.VehicleMaintenanceRecords.AddRange(maintenanceRecords);
                await context.SaveChangesAsync();
            }
        }
    }
}