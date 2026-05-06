using System.ComponentModel.DataAnnotations;

namespace SportBooking.API.Models;

public class Review
{
    public int Id { get; set; }
    public int FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    [Range(1, 5)]
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
