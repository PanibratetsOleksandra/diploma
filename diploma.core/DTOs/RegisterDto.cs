// diploma.core/DTOs/RegisterDto.cs
using System.ComponentModel.DataAnnotations;

namespace diploma.core.DTOs;

public class RegisterDto
{
    //[Required]
    //public string FullName { get; set; }
    public string? FullName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль має бути не менше 8 символів")]
    public string Password { get; set; }
}