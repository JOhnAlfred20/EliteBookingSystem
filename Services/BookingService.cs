using Microsoft.EntityFrameworkCore;
using SportBooking.API.Data;
using SportBooking.API.DTOs;
using SportBooking.API.Models;

namespace SportBooking.API.Services;

public interface IBookingService
{
    Task<PagedResult<BookingDto>> GetAllAsync(int page, int pageSize, string? status);
    Task<PagedResult<BookingDto>> GetUserBookingsAsync(int userId, int page, int pageSize);
    Task<BookingDto?> GetByIdAsync(int id);
    Task<(BookingDto? booking, string error)> CreateAsync(int userId, CreateBookingDto dto);
    Task<bool> CancelAsync(int id, int userId, bool isAdmin);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<bool> HasConflictAsync(int facilityId, DateTime date, TimeSpan start, TimeSpan end, int? excludeId = null);
}

public class BookingService(AppDbContext db, INotificationService notifSvc) : IBookingService
{
    private readonly AppDbContext _db = db;
    private readonly INotificationService _notifSvc = notifSvc;

    private static BookingDto ToDto(Booking b) => new(
        b.Id, b.UserId, b.User.FullName, b.User.Email,
        b.FacilityId, b.Facility.Name, b.Facility.Type,
        b.BookingDate, b.StartTime, b.EndTime,
        b.TotalAmount, b.Status, b.Notes, b.CreatedAt,
        b.Payment == null ? null : new PaymentDto(b.Payment.Id, b.Payment.BookingId, b.Payment.Amount, b.Payment.Method, b.Payment.Status, b.Payment.TransactionId, b.Payment.PaidAt)
    );

    private IQueryable<Booking> BaseQuery() =>
        _db.Bookings.Include(b => b.User).Include(b => b.Facility).Include(b => b.Payment);

    public async Task<PagedResult<BookingDto>> GetAllAsync(int page, int pageSize, string? status)
    {
        var q = BaseQuery();
        if (!string.IsNullOrEmpty(status)) q = q.Where(b => b.Status == status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<BookingDto>([.. items.Select(ToDto)], total, page, pageSize);
    }

    public async Task<PagedResult<BookingDto>> GetUserBookingsAsync(int userId, int page, int pageSize)
    {
        var q = BaseQuery().Where(b => b.UserId == userId);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<BookingDto>([.. items.Select(ToDto)], total, page, pageSize);
    }

    public async Task<BookingDto?> GetByIdAsync(int id)
    {
        var b = await BaseQuery().FirstOrDefaultAsync(x => x.Id == id);
        return b == null ? null : ToDto(b);
    }

    public async Task<(BookingDto? booking, string error)> CreateAsync(int userId, CreateBookingDto dto)
    {
        if (dto.BookingDate.Date < DateTime.UtcNow.Date)
            return (null, "لا يمكن الحجز في تاريخ سابق");

        if (dto.StartTime >= dto.EndTime)
            return (null, "وقت البداية يجب أن يكون قبل وقت النهاية");

        var facility = await _db.Facilities.FindAsync(dto.FacilityId);
        if (facility == null || !facility.IsActive)
            return (null, "المرفق غير متاح");

        using var transaction = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        try
        {
            if (await HasConflictAsync(dto.FacilityId, dto.BookingDate, dto.StartTime, dto.EndTime))
                return (null, "هذا الوقت محجوز بالفعل");

            var hours = (dto.EndTime - dto.StartTime).TotalHours;
            var total = (decimal)hours * facility.PricePerHour;

            var booking = new Booking
            {
                UserId = userId,
                FacilityId = dto.FacilityId,
                BookingDate = dto.BookingDate.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                TotalAmount = total,
                Notes = dto.Notes,
                Status = "Confirmed"
            };
            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            await _notifSvc.CreateAsync(userId, "تم تأكيد الحجز", $"تم حجز {facility.Name} بتاريخ {dto.BookingDate:dd/MM/yyyy}", "Success");

            var created = await BaseQuery().FirstAsync(b => b.Id == booking.Id);
            return (ToDto(created), "");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return (null, "حدث خطأ أثناء حجز المرفق، الرجاء المحاولة مرة أخرى.");
        }
    }

    public async Task<bool> CancelAsync(int id, int userId, bool isAdmin)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return false;
        if (!isAdmin && booking.UserId != userId) return false;
        if (booking.Status == "Cancelled") return false;

        booking.Status = "Cancelled";
        await _db.SaveChangesAsync();
        await _notifSvc.CreateAsync(booking.UserId, "تم إلغاء الحجز", $"تم إلغاء حجزك رقم #{id}", "Warning");
        return true;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return false;
        booking.Status = status;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasConflictAsync(int facilityId, DateTime date, TimeSpan start, TimeSpan end, int? excludeId = null)
    {
        var q = _db.Bookings.Where(b =>
            b.FacilityId == facilityId &&
            b.BookingDate.Date == date.Date &&
            b.Status != "Cancelled" &&
            b.StartTime < end && b.EndTime > start
        );
        if (excludeId.HasValue) q = q.Where(b => b.Id != excludeId.Value);
        return await q.AnyAsync();
    }
}
