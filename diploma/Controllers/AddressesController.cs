using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    // Отримати всі адреси поточного юзера
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserAddress>>> GetMyAddresses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _context.UserAddresses
            .Where(x => x.UserId == userId)
            .ToListAsync();
    }

    // Додати нову адресу
    [HttpPost]
    public async Task<ActionResult<UserAddress>> AddAddress(UserAddress address)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        address.UserId = userId!;

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(address);
    }

    // Видалити адресу
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var address = await _context.UserAddresses
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (address == null) return NotFound();

        _context.UserAddresses.Remove(address);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}