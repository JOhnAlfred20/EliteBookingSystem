using Microsoft.EntityFrameworkCore;
using SportBooking.API.Models;

namespace SportBooking.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User).WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Facility).WithMany(f => f.Bookings)
            .HasForeignKey(b => b.FacilityId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Booking).WithOne(b => b.Payment)
            .HasForeignKey<Payment>(p => p.BookingId);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Facility)
            .WithMany()
            .HasForeignKey(r => r.FacilityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FullName = "Admin",
            Email = "admin@sportbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Phone = "01000000000",
            Role = "Admin",
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed facilities
        modelBuilder.Entity<Facility>().HasData(
            new Facility { Id = 1, Name = "ملعب كرة قدم A", Type = "Football", Capacity = 22, PricePerHour = 200, Description = "ملعب كرة قدم عشب طبيعي", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Facility { Id = 2, Name = "صالة كرة السلة", Type = "Basketball", Capacity = 10, PricePerHour = 150, Description = "صالة مغطاة لكرة السلة", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Facility { Id = 3, Name = "ملعب تنس", Type = "Tennis", Capacity = 4, PricePerHour = 100, Description = "ملعب تنس بأرضية صلبة", IsActive = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
