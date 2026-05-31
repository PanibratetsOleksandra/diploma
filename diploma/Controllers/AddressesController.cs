using diploma.business.Services;
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
    private readonly IAddressService _addressService;

    public AddressesController(AppDbContext context, IAddressService addressService)
    {
        _context = context;
        _addressService = addressService;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserAddress>>> GetMyAddresses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _context.UserAddresses
            .Where(x => x.UserId == userId)
            .ToListAsync();
    }


    [HttpPost]
    public async Task<ActionResult<UserAddress>> AddAddress(UserAddress address)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        address.UserId = userId!;

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(address);
    }


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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, UserAddress updatedAddress)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId == null) return NotFound();
        var address = await _addressService.UpdateAddress(userId, id, updatedAddress);
        if (address == null) return NotFound();
        return Ok(address);
    }
}