using Microsoft.EntityFrameworkCore;
using SportBooking.API.Data;
using SportBooking.API.DTOs;
using SportBooking.API.Helpers;
using SportBooking.API.Models;

namespace SportBooking.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<UserDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}

public class AuthService(AppDbContext db, JwtHelper jwt) : IAuthService
{
    private readonly AppDbContext _db = db;
    private readonly JwtHelper _jwt = jwt;

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto(_jwt.GenerateToken(user), user.Role, user.FullName, user.Id);
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return null;

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = "User"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponseDto(_jwt.GenerateToken(user), user.Role, user.FullName, user.Id);
    }

    public async Task<UserDto?> GetProfileAsync(int userId)
    {
        var u = await _db.Users.FindAsync(userId);
        if (u == null) return null;
        return new UserDto(u.Id, u.FullName, u.Email, u.Phone, u.Role, u.IsActive, u.CreatedAt);
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;
        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash)) return false;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return true;
    }
}
