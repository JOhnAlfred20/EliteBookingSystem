using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SportBooking.API.DTOs;
using SportBooking.API.Services;
using SportBooking.API.Data;

namespace SportBooking.API.Controllers;

// ─── Auth Controller ────────────────────────────────────────────────────────
[ApiController, Route("api/[controller]")]
public class AuthController(IAuthService svc) : ControllerBase
{
    private readonly IAuthService _svc = svc;

    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _svc.LoginAsync(dto);
        if (result == null) return Unauthorized(new { message = "بيانات الدخول غير صحيحة" });
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _svc.RegisterAsync(dto);
        if (result == null) return BadRequest(new { message = "البريد الإلكتروني مستخدم بالفعل" });
        return Ok(result);
    }

    [Authorize, HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        var result = await _svc.GetProfileAsync(UserId);
        return result == null ? NotFound() : Ok(result);
    }

    [Authorize, HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var ok = await _svc.UpdateProfileAsync(UserId, dto);
        return ok ? Ok(new { message = "تم التحديث بنجاح" }) : NotFound();
    }

    [Authorize, HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var ok = await _svc.ChangePasswordAsync(UserId, dto);
        return ok ? Ok(new { message = "تم تغيير كلمة السر" }) : BadRequest(new { message = "كلمة السر الحالية غير صحيحة" });
    }
}

// ─── Facilities Controller ──────────────────────────────────────────────────
[ApiController, Route("api/[controller]")]
public class FacilitiesController(IFacilityService svc) : ControllerBase
{
    private readonly IFacilityService _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? active) => Ok(await _svc.GetAllAsync(active));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var f = await _svc.GetByIdAsync(id);
        return f == null ? NotFound() : Ok(f);
    }

    [Authorize(Roles = "Admin"), HttpPost]
    public async Task<IActionResult> Create(CreateFacilityDto dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize(Roles = "Admin"), HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateFacilityDto dto)
    {
        var ok = await _svc.UpdateAsync(id, dto);
        return ok ? Ok(new { message = "تم التحديث" }) : NotFound();
    }

    [Authorize(Roles = "Admin"), HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _svc.DeleteAsync(id);
        return ok ? Ok(new { message = "تم الحذف" }) : NotFound();
    }

    [HttpGet("{id}/timeslots")]
    public async Task<IActionResult> GetTimeSlots(int id) => Ok(await _svc.GetTimeSlotsAsync(id));

    [Authorize(Roles = "Admin"), HttpPost("timeslots")]
    public async Task<IActionResult> AddTimeSlot(CreateTimeSlotDto dto) => Ok(await _svc.AddTimeSlotAsync(dto));

    [Authorize(Roles = "Admin"), HttpDelete("timeslots/{id}")]
    public async Task<IActionResult> DeleteTimeSlot(int id)
    {
        var ok = await _svc.DeleteTimeSlotAsync(id);
        return ok ? Ok() : NotFound();
    }

    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetReviews(int id) => Ok(await _svc.GetReviewsAsync(id));

    [Authorize, HttpPost("{id}/reviews")]
    public async Task<IActionResult> AddReview(int id, CreateReviewDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);
        return Ok(await _svc.AddReviewAsync(id, userId, dto));
    }
}

// ─── Bookings Controller ────────────────────────────────────────────────────
[ApiController, Route("api/[controller]"), Authorize]
public class BookingsController(IBookingService svc) : ControllerBase
{
    private readonly IBookingService _svc = svc;

    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    bool IsAdmin => User.IsInRole("Admin");

    [Authorize(Roles = "Admin"), HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        => Ok(await _svc.GetAllAsync(page, pageSize, status));

    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        => Ok(await _svc.GetUserBookingsAsync(UserId, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var b = await _svc.GetByIdAsync(id);
        if (b == null) return NotFound();
        if (!IsAdmin && b.UserId != UserId) return Forbid();
        return Ok(b);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingDto dto)
    {
        var (booking, error) = await _svc.CreateAsync(UserId, dto);
        if (booking == null) return BadRequest(new { message = error });
        return Ok(booking);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var ok = await _svc.CancelAsync(id, UserId, IsAdmin);
        return ok ? Ok(new { message = "تم إلغاء الحجز" }) : BadRequest(new { message = "لا يمكن إلغاء هذا الحجز" });
    }

    [Authorize(Roles = "Admin"), HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateBookingStatusDto dto)
    {
        var ok = await _svc.UpdateStatusAsync(id, dto.Status);
        return ok ? Ok() : NotFound();
    }

    [HttpGet("check-conflict")]
    public async Task<IActionResult> CheckConflict([FromQuery] int facilityId, [FromQuery] DateTime date, [FromQuery] TimeSpan start, [FromQuery] TimeSpan end)
    {
        var conflict = await _svc.HasConflictAsync(facilityId, date, start, end);
        return Ok(new { hasConflict = conflict });
    }
}

// ─── Payments Controller ────────────────────────────────────────────────────
[ApiController, Route("api/[controller]"), Authorize]
public class PaymentsController(IPaymentService svc, IConfiguration config) : ControllerBase
{
    private readonly IPaymentService _svc = svc;
    private readonly IConfiguration _config = config;

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetByBooking(int bookingId)
    {
        var p = await _svc.GetByBookingIdAsync(bookingId);
        return p == null ? NotFound() : Ok(p);
    }

    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession(CreatePaymentDto dto)
    {
        try 
        {
            var booking = await _svc.GetByBookingIdAsync(dto.BookingId);
            // Defaulting amount to 100 for example, assume _svc exposes booking amount, or just fetch it
            // Let's create payment record as pending
            var payment = await _svc.CreateAsync(new CreatePaymentDto(dto.BookingId, "Stripe", null));

            Stripe.StripeConfiguration.ApiKey = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"; // Standard Stripe test key

            var options = new Stripe.Checkout.SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new()
                    {
                        PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(payment.Amount * 100), // cents
                            Currency = "egp",
                            ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"حجز ملعب الطلب #{dto.BookingId}",
                            },
                        },
                        Quantity = 1,
                    },
                ],
                Mode = "payment",
                SuccessUrl = $"http://localhost:5173/bookings?payment_success=true&booking_id={dto.BookingId}",
                CancelUrl = "http://localhost:5173/bookings?payment_cancelled=true",
            };

            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);

            return Ok(new { url = session.Url });
        }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize(Roles = "Admin"), HttpPut("booking/{bookingId}/status")]
    public async Task<IActionResult> UpdateStatus(int bookingId, UpdatePaymentStatusDto dto)
    {
        var ok = await _svc.UpdateStatusAsync(bookingId, dto);
        return ok ? Ok() : NotFound();
    }
}

// ─── Notifications Controller ───────────────────────────────────────────────
[ApiController, Route("api/[controller]"), Authorize]
public class NotificationsController(INotificationService svc) : ControllerBase
{
    private readonly INotificationService _svc = svc;

    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetUserNotificationsAsync(UserId));

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount() => Ok(new { count = await _svc.GetUnreadCountAsync(UserId) });

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var ok = await _svc.MarkReadAsync(id, UserId);
        return ok ? Ok() : NotFound();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _svc.MarkAllReadAsync(UserId);
        return Ok();
    }
}

// ─── Reports Controller ─────────────────────────────────────────────────────
[ApiController, Route("api/[controller]"), Authorize(Roles = "Admin")]
public class ReportsController(IReportService svc) : ControllerBase
{
    private readonly IReportService _svc = svc;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() => Ok(await _svc.GetDashboardStatsAsync());
}

// ─── Users Controller (Admin only) ─────────────────────────────────────────
[ApiController, Route("api/[controller]"), Authorize(Roles = "Admin")]
public class UsersController(SportBooking.API.Data.AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .Select(u => new UserDto(u.Id, u.FullName, u.Email, u.Phone, u.Role, u.IsActive, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new { isActive = user.IsActive });
    }
}
