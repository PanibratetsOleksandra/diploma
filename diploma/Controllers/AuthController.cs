// diploma/Controllers/AuthController.cs
using diploma.business.Services; // Імпортуємо ваш новий сервіс
using diploma.core.DTOs;
using diploma.core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly TokenService _tokenService;

    public AuthController(UserManager<AppUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized("Invalid email");

        // Перевірка пароля через UserManager
        var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password");

        return Ok(new
        {
            token = _tokenService.CreateToken(user),
            email = user.Email,
            fullName = user.FullName
        });
    }
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto)
    {
       
        // Перевірка, чи не зайнятий Email
        if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest(new List<string>() { "Користувач з таким Email вже існує" });
        }

        var user = new AppUser
        {
            UserName = registerDto.Email, // Identity потребує UserName
            Email = registerDto.Email,
            FullName = registerDto.FullName
        };

        // Створення користувача з хешуванням пароля
        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            return BadRequest(errors);

        }

            // Повертаємо дані разом із токеном для миттєвого входу
            return Ok(new
        {
            token = _tokenService.CreateToken(user),
            email = user.Email,
            fullName = user.FullName
        });
    }
}