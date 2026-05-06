using Microsoft.EntityFrameworkCore;
using SportBooking.API.Data;
using SportBooking.API.DTOs;
using SportBooking.API.Models;

namespace SportBooking.API.Services;

// ─── Facility Service ───────────────────────────────────────────────────────
public interface IFacilityService
{
    Task<List<FacilityDto>> GetAllAsync(bool? active = null);
    Task<FacilityDto?> GetByIdAsync(int id);
    Task<FacilityDto> CreateAsync(CreateFacilityDto dto);
    Task<bool> UpdateAsync(int id, UpdateFacilityDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<TimeSlotDto>> GetTimeSlotsAsync(int facilityId);
    Task<TimeSlotDto> AddTimeSlotAsync(CreateTimeSlotDto dto);
    Task<bool> DeleteTimeSlotAsync(int id);
    Task<ReviewDto> AddReviewAsync(int facilityId, int userId, CreateReviewDto dto);
    Task<List<ReviewDto>> GetReviewsAsync(int facilityId);
}

public class FacilityService(AppDbContext db) : IFacilityService
{
    private readonly AppDbContext _db = db;

    private static FacilityDto ToDto(Facility f) =>
        new(f.Id, f.Name, f.Description, f.Type, f.Capacity, f.PricePerHour, f.ImageUrl, f.IsActive);

    public async Task<List<FacilityDto>> GetAllAsync(bool? active = null)
    {
        var q = _db.Facilities.AsQueryable();
        if (active.HasValue) q = q.Where(f => f.IsActive == active.Value);
        return await q.Select(f => new FacilityDto(f.Id, f.Name, f.Description, f.Type, f.Capacity, f.PricePerHour, f.ImageUrl, f.IsActive)).ToListAsync();
    }

    public async Task<FacilityDto?> GetByIdAsync(int id)
    {
        var f = await _db.Facilities.FindAsync(id);
        return f == null ? null : ToDto(f);
    }

    public async Task<FacilityDto> CreateAsync(CreateFacilityDto dto)
    {
        var f = new Facility { Name = dto.Name, Description = dto.Description, Type = dto.Type, Capacity = dto.Capacity, PricePerHour = dto.PricePerHour, ImageUrl = dto.ImageUrl };
        _db.Facilities.Add(f);
        await _db.SaveChangesAsync();
        return ToDto(f);
    }

    public async Task<bool> UpdateAsync(int id, UpdateFacilityDto dto)
    {
        var f = await _db.Facilities.FindAsync(id);
        if (f == null) return false;
        f.Name = dto.Name; f.Description = dto.Description; f.Type = dto.Type;
        f.Capacity = dto.Capacity; f.PricePerHour = dto.PricePerHour; f.ImageUrl = dto.ImageUrl; f.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var f = await _db.Facilities.FindAsync(id);
        if (f == null) return false;
        f.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<TimeSlotDto>> GetTimeSlotsAsync(int facilityId) =>
        await _db.TimeSlots.Where(t => t.FacilityId == facilityId)
            .Select(t => new TimeSlotDto(t.Id, t.FacilityId, t.DayOfWeek, t.StartTime, t.EndTime, t.IsAvailable))
            .ToListAsync();

    public async Task<TimeSlotDto> AddTimeSlotAsync(CreateTimeSlotDto dto)
    {
        var ts = new TimeSlot { FacilityId = dto.FacilityId, DayOfWeek = dto.DayOfWeek, StartTime = dto.StartTime, EndTime = dto.EndTime };
        _db.TimeSlots.Add(ts);
        await _db.SaveChangesAsync();
        return new TimeSlotDto(ts.Id, ts.FacilityId, ts.DayOfWeek, ts.StartTime, ts.EndTime, ts.IsAvailable);
    }

    public async Task<bool> DeleteTimeSlotAsync(int id)
    {
        var ts = await _db.TimeSlots.FindAsync(id);
        if (ts == null) return false;
        _db.TimeSlots.Remove(ts);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ReviewDto> AddReviewAsync(int facilityId, int userId, CreateReviewDto dto)
    {
        var review = new Review
        {
            FacilityId = facilityId, UserId = userId,
            Rating = dto.Rating, Comment = dto.Comment
        };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        var created = await _db.Reviews.Include(r => r.User).FirstAsync(r => r.Id == review.Id);
        return new ReviewDto(created.Id, created.FacilityId, created.UserId, created.User.FullName, created.Rating, created.Comment, created.CreatedAt);
    }

    public async Task<List<ReviewDto>> GetReviewsAsync(int facilityId)
    {
        return await _db.Reviews.Include(r => r.User)
            .Where(r => r.FacilityId == facilityId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(r.Id, r.FacilityId, r.UserId, r.User.FullName, r.Rating, r.Comment, r.CreatedAt))
            .ToListAsync();
    }
}

// ─── Notification Service ───────────────────────────────────────────────────
public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task CreateAsync(int userId, string title, string message, string type = "Info");
    Task<bool> MarkReadAsync(int id, int userId);
    Task MarkAllReadAsync(int userId);
}

public class NotificationService(AppDbContext db) : INotificationService
{
    private readonly AppDbContext _db = db;

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId) =>
        await _db.Notifications.Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAt))
            .ToListAsync();

    public async Task<int> GetUnreadCountAsync(int userId) =>
        await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task CreateAsync(int userId, string title, string message, string type = "Info")
    {
        _db.Notifications.Add(new Notification { UserId = userId, Title = title, Message = message, Type = type });
        await _db.SaveChangesAsync();
    }

    public async Task<bool> MarkReadAsync(int id, int userId)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (n == null) return false;
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllReadAsync(int userId)
    {
        await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }
}

// ─── Payment Service ────────────────────────────────────────────────────────
public interface IPaymentService
{
    Task<PaymentDto?> GetByBookingIdAsync(int bookingId);
    Task<PaymentDto> CreateAsync(CreatePaymentDto dto);
    Task<bool> UpdateStatusAsync(int bookingId, UpdatePaymentStatusDto dto);
}

public class PaymentService(AppDbContext db) : IPaymentService
{
    private readonly AppDbContext _db = db;

    public async Task<PaymentDto?> GetByBookingIdAsync(int bookingId)
    {
        var p = await _db.Payments.FirstOrDefaultAsync(x => x.BookingId == bookingId);
        return p == null ? null : new PaymentDto(p.Id, p.BookingId, p.Amount, p.Method, p.Status, p.TransactionId, p.PaidAt);
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
    {
        var booking = await _db.Bookings.FindAsync(dto.BookingId)
            ?? throw new Exception("Booking not found");

        var payment = new Payment
        {
            BookingId = dto.BookingId,
            Amount = booking.TotalAmount,
            Method = dto.Method,
            Status = "Paid",
            TransactionId = dto.TransactionId ?? Guid.NewGuid().ToString("N")[..12].ToUpper(),
            PaidAt = DateTime.UtcNow
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return new PaymentDto(payment.Id, payment.BookingId, payment.Amount, payment.Method, payment.Status, payment.TransactionId, payment.PaidAt);
    }

    public async Task<bool> UpdateStatusAsync(int bookingId, UpdatePaymentStatusDto dto)
    {
        var p = await _db.Payments.FirstOrDefaultAsync(x => x.BookingId == bookingId);
        if (p == null) return false;
        p.Status = dto.Status;
        if (dto.Status == "Paid") p.PaidAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }
}

// ─── Report Service ─────────────────────────────────────────────────────────
public interface IReportService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}

public class ReportService(AppDbContext db) : IReportService
{
    private readonly AppDbContext _db = db;

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var totalBookings = await _db.Bookings.CountAsync();
        var todayBookings = await _db.Bookings.CountAsync(b => b.BookingDate.Date == now.Date);
        var pendingBookings = await _db.Bookings.CountAsync(b => b.Status == "Pending");
        var totalUsers = await _db.Users.CountAsync(u => u.Role == "User");
        var activeFacilities = await _db.Facilities.CountAsync(f => f.IsActive);
        var totalRevenue = await _db.Payments.Where(p => p.Status == "Paid").SumAsync(p => p.Amount);
        var monthRevenue = await _db.Payments.Where(p => p.Status == "Paid" && p.PaidAt!.Value.Month == now.Month && p.PaidAt.Value.Year == now.Year).SumAsync(p => p.Amount);

        var monthly = await _db.Payments
            .Where(p => p.Status == "Paid" && p.PaidAt!.Value >= now.AddMonths(-6))
            .GroupBy(p => new { p.PaidAt!.Value.Year, p.PaidAt.Value.Month })
            .Select(g => new MonthlyRevenueDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(p => p.Amount),
                g.Count()
            ))
            .ToListAsync();

        var facilityStats = await _db.Bookings
            .Where(b => b.Status != "Cancelled")
            .GroupBy(b => b.Facility.Name)
            .Select(g => new FacilityStatsDto(
                g.Key,
                g.Count(),
                g.Sum(b => b.TotalAmount)
            ))
            .ToListAsync();

        return new DashboardStatsDto(totalBookings, todayBookings, pendingBookings, totalUsers, activeFacilities, totalRevenue, monthRevenue, monthly, facilityStats);
    }
}
