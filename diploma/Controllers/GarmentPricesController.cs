using diploma.core;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.ADMIN)]
public class GarmentPricesController : ControllerBase
{
    private readonly AppDbContext _context;

    public GarmentPricesController(AppDbContext context) => _context = context;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() => Ok(await _context.GarmentPrices.ToListAsync());

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePrice(int id, [FromBody] decimal newPrice)
    {
        var item = await _context.GarmentPrices.FindAsync(id);
        if (item == null) return NotFound();

        item.BasePrice = newPrice;
        item.LastUpdated = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(item);
    }


    [HttpPost]
    public async Task<IActionResult> CreatePrice([FromBody] GarmentPrice request)
    {
        if (await _context.GarmentPrices.AnyAsync(p => p.GarmentType == request.GarmentType))
            return BadRequest("Такий тип виробу вже існує");

        request.LastUpdated = DateTime.UtcNow;
        _context.GarmentPrices.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePrice(int id)
    {
        var item = await _context.GarmentPrices.FindAsync(id);
        if (item == null) return NotFound();
        _context.GarmentPrices.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}