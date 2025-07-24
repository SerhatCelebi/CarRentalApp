using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DriveZone.Server.Models;
using DriveZone.Server.Models.Enums;

namespace DriveZone.Server.Data
{
    public class DriveZoneContext : IdentityDbContext<Member>
    {
        public DriveZoneContext(DbContextOptions<DriveZoneContext> options) : base(options) { }

        // DbSets for DriveZone entities
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<VehicleMaintenanceRecord> VehicleMaintenanceRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Vehicle entity
            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.HasKey(v => v.VehicleId);
                entity.Property(v => v.Make).IsRequired().HasMaxLength(50);
                entity.Property(v => v.Model).IsRequired().HasMaxLength(50);
                entity.Property(v => v.Color).IsRequired().HasMaxLength(30);
                entity.Property(v => v.LicensePlate).IsRequired().HasMaxLength(20);
                entity.Property(v => v.DailyRate).HasColumnType("decimal(18,2)");
                entity.Property(v => v.HourlyRate).HasColumnType("decimal(18,2)");
                entity.Property(v => v.SecurityDeposit).HasColumnType("decimal(18,2)");
                entity.Property(v => v.Mileage).HasColumnType("decimal(18,2)");
                entity.HasIndex(v => v.LicensePlate).IsUnique();
                entity.HasIndex(v => new { v.Location, v.IsAvailable });
            });

            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.BookingId);
                entity.Property(b => b.BookingReference).IsRequired().HasMaxLength(20);
                entity.Property(b => b.BaseAmount).HasColumnType("decimal(18,2)");
                entity.Property(b => b.TaxAmount).HasColumnType("decimal(18,2)");
                entity.Property(b => b.SecurityDeposit).HasColumnType("decimal(18,2)");
                entity.Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(b => b.InsuranceCost).HasColumnType("decimal(18,2)");
                entity.HasIndex(b => b.BookingReference).IsUnique();
                entity.HasIndex(b => new { b.Status, b.CreatedAt });

                // Configure relationships
                entity.HasOne(b => b.Vehicle)
                      .WithMany(v => v.Bookings)
                      .HasForeignKey(b => b.VehicleId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Member)
                      .WithMany(m => m.Bookings)
                      .HasForeignKey(b => b.MemberId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Member entity (extends IdentityUser)
            modelBuilder.Entity<Member>(entity =>
            {
                entity.Property(m => m.MemberId).IsRequired().HasMaxLength(20);
                entity.Property(m => m.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(m => m.LastName).IsRequired().HasMaxLength(50);
                entity.Property(m => m.FullAddress).IsRequired().HasMaxLength(200);
                entity.Property(m => m.ZipCode).IsRequired().HasMaxLength(10);
                entity.Property(m => m.NationalIdNumber).IsRequired().HasMaxLength(20);
                entity.Property(m => m.DriverLicenseNumber).IsRequired().HasMaxLength(30);
                entity.Property(m => m.TotalSpent).HasColumnType("decimal(18,2)");
                entity.HasIndex(m => m.MemberId).IsUnique();
                entity.HasIndex(m => m.NationalIdNumber).IsUnique();
                entity.HasIndex(m => m.DriverLicenseNumber).IsUnique();
                entity.HasIndex(m => new { m.MembershipLevel, m.IsVipMember });
            });

            // Configure VehicleMaintenanceRecord entity
            modelBuilder.Entity<VehicleMaintenanceRecord>(entity =>
            {
                entity.HasKey(r => r.RecordId);
                entity.Property(r => r.Cost).HasColumnType("decimal(18,2)");
                entity.Property(r => r.MileageAtService).HasColumnType("decimal(18,2)");
                entity.Property(r => r.NextServiceMileage).HasColumnType("decimal(18,2)");

                entity.HasOne(r => r.Vehicle)
                      .WithMany(v => v.MaintenanceRecords)
                      .HasForeignKey(r => r.VehicleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed default roles
            var adminRoleId = Guid.NewGuid().ToString();
            var memberRoleId = Guid.NewGuid().ToString();

            modelBuilder.Entity<IdentityRole>().HasData(
                new IdentityRole
                {
                    Id = adminRoleId,
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole
                {
                    Id = memberRoleId,
                    Name = "Member",
                    NormalizedName = "MEMBER"
                }
            );

            // Seed sample vehicles
            modelBuilder.Entity<Vehicle>().HasData(
                new Vehicle
                {
                    VehicleId = Guid.NewGuid().ToString(),
                    Make = "BMW",
                    Model = "320i",
                    Color = "Siyah",
                    ManufactureYear = 2024,
                    Category = VehicleCategory.Premium,
                    FuelType = FuelType.Gasoline,
                    Transmission = TransmissionType.Automatic,
                    SeatingCapacity = 5,
                    DailyRate = 850.00m,
                    HourlyRate = 120.00m,
                    SecurityDeposit = 2500.00m,
                    Location = LocationCode.TR,
                    LicensePlate = "34 DZ 2024",
                    Mileage = 15000,
                    Description = "Premium sedan araç, tüm konfor özellikleri mevcut",
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Vehicle
                {
                    VehicleId = Guid.NewGuid().ToString(),
                    Make = "Audi",
                    Model = "A4",
                    Color = "Gümüş",
                    ManufactureYear = 2023,
                    Category = VehicleCategory.Premium,
                    FuelType = FuelType.Hybrid,
                    Transmission = TransmissionType.Automatic,
                    SeatingCapacity = 5,
                    DailyRate = 920.00m,
                    HourlyRate = 130.00m,
                    SecurityDeposit = 2800.00m,
                    Location = LocationCode.TR,
                    LicensePlate = "06 DZ 2023",
                    Mileage = 8500,
                    Description = "Hibrit teknolojili premium sedan",
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}