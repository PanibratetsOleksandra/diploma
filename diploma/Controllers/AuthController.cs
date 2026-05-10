
using diploma.business.Services;
using diploma.core;
using diploma.core.DTOs;
using diploma.core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

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

        var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

        if (!result) return Unauthorized("Invalid password");

        return Ok(new
        {
            token = await _tokenService.CreateToken(user),
            email = user.Email,
            fullName = user.FullName
        });
    }


    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest(new List<string>() { "Користувач з таким Email вже існує" });
        }
        AppUser user;
        try
        {
            using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                user = new AppUser
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName ?? ""
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description);
                    return BadRequest(errors);
                }

                var roleResult = await _userManager.AddToRoleAsync(user, Roles.USER);
                if (!roleResult.Succeeded)
                {
                    var roleErrors = roleResult.Errors.Select(e => e.Description);
                    return BadRequest(roleErrors);
                }
                transaction.Complete();
            }


            return Ok(new
            {
                token = await _tokenService.CreateToken(user),
                email = user.Email,
                fullName = user.FullName
            });
        }
        catch (Exception ex)
        {

            return BadRequest(new List<string> { "Помилка при реєстрації. Зміни скасовано." });
        }
    }
}