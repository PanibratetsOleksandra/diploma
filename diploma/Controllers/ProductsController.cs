using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using diploma.core.Entities;
using diploma.dal;

namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Отримати всі товари з фото та розмірами
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Photos) // Обов'язково завантажуємо фото
                .ToListAsync();
        }

        // 2. Отримати один товар за ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            return product;
        }

        // 3. Створити новий товар
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            // Перевіряємо, чи є фото, і встановлюємо зв'язок, якщо потрібно
            if (product.Photos != null && product.Photos.Any())
            {
                foreach (var photo in product.Photos)
                {
                    // EF автоматично підхопить зв'язок через навігаційну властивість
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Повертаємо створений об'єкт із присвоєним ID
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();

            _context.Entry(product).State = EntityState.Modified;

            // Якщо є вкладені фото, їх теж треба позначити як змінені або обробити окремо
            foreach (var photo in product.Photos)
            {
                _context.Entry(photo).State = photo.Id == 0 ? EntityState.Added : EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 5. Видалити товар
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}