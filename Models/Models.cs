using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SportBooking.API.Models;

public class User
{
    public int Id { get; set; }
    [Required, MaxLength(100)] public string FullName { get; set; } = "";
    [Required, MaxLength(150)] public string Email { get; set; } = "";
    [Required] public string PasswordHash { get; set; } = "";
    [MaxLength(20)] public string Phone { get; set; } = "";
    public string Role { get; set; } = "User"; // User | Admin
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class Facility
{
    public int Id { get; set; }
    [Required, MaxLength(150)] public string Name { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
    public string Type { get; set; } = "Football"; // Football | Basketball | Tennis | Gym | Swimming
    public int Capacity { get; set; } = 1;
    [Column(TypeName = "decimal(10,2)")] public decimal PricePerHour { get; set; }
    public string ImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class TimeSlot
{
    public int Id { get; set; }
    public int FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
    public DateTime BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    [Column(TypeName = "decimal(10,2)")] public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending | Confirmed | Cancelled | Completed
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Payment? Payment { get; set; }
}

public class Payment
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    [Column(TypeName = "decimal(10,2)")] public decimal Amount { get; set; }
    public string Method { get; set; } = "Cash"; // Cash | Card | Online
    public string Status { get; set; } = "Pending"; // Pending | Paid | Refunded | Failed
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string Type { get; set; } = "Info"; // Info | Success | Warning | Error
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
