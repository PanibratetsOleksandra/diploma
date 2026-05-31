using diploma.core;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class NewsletterController : ControllerBase
{
    private readonly AppDbContext _context;
    public NewsletterController(AppDbContext context) => _context = context;

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
            return BadRequest("Некоректний Email");

        var exists = await _context.NewsletterSubscribers
            .AnyAsync(s => s.Email.ToLower() == request.Email.ToLower());

        if (exists)
            return BadRequest("Цей Email вже підписаний на розсилку!");

        var subscriber = new NewsletterSubscriber { Email = request.Email };
        _context.NewsletterSubscribers.Add(subscriber);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Підписка успішна!" });
    }

    [HttpGet("subscribers")]
    [Authorize(Roles = Roles.ADMIN)]
    public async Task<IActionResult> GetSubscribers()
    {
        var list = await _context.NewsletterSubscribers
            .OrderByDescending(s => s.SubscribedAt)
            .ToListAsync();
        return Ok(list);
    }
}