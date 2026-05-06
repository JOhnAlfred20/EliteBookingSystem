namespace SportBooking.API.DTOs;

// Auth DTOs
public record RegisterDto(string FullName, string Email, string Password, string Phone);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Role, string FullName, int UserId);
public record UpdateProfileDto(string FullName, string Phone);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

// User DTOs
public record UserDto(int Id, string FullName, string Email, string Phone, string Role, bool IsActive, DateTime CreatedAt);

// Facility DTOs
public record FacilityDto(int Id, string Name, string Description, string Type, int Capacity, decimal PricePerHour, string ImageUrl, bool IsActive);
public record CreateFacilityDto(string Name, string Description, string Type, int Capacity, decimal PricePerHour, string ImageUrl);
public record UpdateFacilityDto(string Name, string Description, string Type, int Capacity, decimal PricePerHour, string ImageUrl, bool IsActive);

// TimeSlot DTOs
public record TimeSlotDto(int Id, int FacilityId, DayOfWeek DayOfWeek, TimeSpan StartTime, TimeSpan EndTime, bool IsAvailable);
public record CreateTimeSlotDto(int FacilityId, DayOfWeek DayOfWeek, TimeSpan StartTime, TimeSpan EndTime);

// Booking DTOs
public record CreateBookingDto(int FacilityId, DateTime BookingDate, TimeSpan StartTime, TimeSpan EndTime, string? Notes);

public record BookingDto(
    int Id, int UserId, string UserName, string UserEmail,
    int FacilityId, string FacilityName, string FacilityType,
    DateTime BookingDate, TimeSpan StartTime, TimeSpan EndTime,
    decimal TotalAmount, string Status, string? Notes, DateTime CreatedAt,
    PaymentDto? Payment
);

public record UpdateBookingStatusDto(string Status);

// Payment DTOs
public record PaymentDto(int Id, int BookingId, decimal Amount, string Method, string Status, string? TransactionId, DateTime? PaidAt);
public record CreatePaymentDto(int BookingId, string Method, string? TransactionId);
public record UpdatePaymentStatusDto(string Status);

// Notification DTOs
public record NotificationDto(int Id, string Title, string Message, string Type, bool IsRead, DateTime CreatedAt);

// Report DTOs
public record DashboardStatsDto(
    int TotalBookings, int TodayBookings, int PendingBookings,
    int TotalUsers, int ActiveFacilities,
    decimal TotalRevenue, decimal MonthRevenue,
    List<MonthlyRevenueDto> MonthlyRevenue,
    List<FacilityStatsDto> FacilityStats
);
public record MonthlyRevenueDto(string Month, decimal Revenue, int Bookings);
public record FacilityStatsDto(string Name, int TotalBookings, decimal Revenue);

// Generic
public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);
public record ApiResponse<T>(bool Success, string Message, T? Data = default);

// Review DTOs
public record ReviewDto(int Id, int FacilityId, int UserId, string UserName, int Rating, string? Comment, DateTime CreatedAt);
public record CreateReviewDto(int Rating, string? Comment);
