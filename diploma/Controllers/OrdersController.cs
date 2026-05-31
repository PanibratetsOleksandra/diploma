using diploma.core.DTOs;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }


        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {

            order.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;


            _context.Orders.Add(order);
            await _context.SaveChangesAsync();


            if (order.Items != null && order.Items.Any())
            {
                foreach (var item in order.Items)
                {

                    if (item.Type == "product")
                    {

                        var shopProduct = await _context.Products
                            .FirstOrDefaultAsync(p => p.Name == item.Name);

                        if (shopProduct != null)
                        {

                            _context.Products.Remove(shopProduct);
                        }
                    }
                }


                await _context.SaveChangesAsync();
            }


            return Ok(new { id = order.Id });
        }


        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var orders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Замовлення не знайдено" });
            }

            order.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = order.Id,
                status = order.Status
            });
        }
    }
}