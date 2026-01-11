// diploma.core/DTOs/LoginDto.cs
using System.ComponentModel.DataAnnotations;

namespace diploma.core.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "Email є обов'язковим")]
    [EmailAddress(ErrorMessage = "Некоректний формат Email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Пароль є обов'язковим")]
    public string Password { get; set; }
}