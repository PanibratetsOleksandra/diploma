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

        //[HttpPut("{id}")]
        //public async Task<IActionResult> UpdateProduct(int id, Product product)
        //{
        //    if (id != product.Id) return BadRequest();

        //    _context.Entry(product).State = EntityState.Modified;

        //    // Якщо є вкладені фото, їх теж треба позначити як змінені або обробити окремо
        //    foreach (var photo in product.Photos)
        //    {
        //        _context.Entry(photo).State = photo.Id == 0 ? EntityState.Added : EntityState.Modified;
        //    }

        //    await _context.SaveChangesAsync();
        //    return NoContent();
        //}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();

            // 1. Завантажуємо існуючий товар разом із його фотографіями з бази
            var dbProduct = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (dbProduct == null) return NotFound();

            // 2. Оновлюємо основні поля товару
            _context.Entry(dbProduct).CurrentValues.SetValues(product);
            dbProduct.AvailableSizes = product.AvailableSizes; // Якщо це список, оновлюємо вручну

            // 3. ВИДАЛЕННЯ: Знаходимо фото, які є в базі, але яких немає в присланому об'єкті
            foreach (var dbPhoto in dbProduct.Photos.ToList())
            {
                if (!product.Photos.Any(p => p.Id == dbPhoto.Id))
                {
                    _context.ProductPhotos.Remove(dbPhoto);                }
            }

            // 4. ДОДАВАННЯ ТА ОНОВЛЕННЯ:
            foreach (var incomingPhoto in product.Photos)
            {
                var dbPhoto = dbProduct.Photos.FirstOrDefault(p => p.Id == incomingPhoto.Id && p.Id != 0);

                if (dbPhoto != null)
                {
                    // Оновлюємо існуюче фото (наприклад, змінили статус isMain)
                    _context.Entry(dbPhoto).CurrentValues.SetValues(incomingPhoto);
                }
                else
                {
                    // Додаємо нове фото (якого ще немає в базі для цього товару)
                    dbProduct.Photos.Add(incomingPhoto);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id)) return NotFound();
                throw;
            }

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
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFiles(List<IFormFile> files)
        {
            var urls = new List<string>();
            // Шлях до папки wwwroot/images/products
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");

            if (!Directory.Exists(path)) Directory.CreateDirectory(path);

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    // Створюємо унікальне ім'я, щоб фото не затирали одне одного
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var fullPath = Path.Combine(path, fileName);

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Повертаємо шлях, який буде доступний через браузер
                  urls.Add($"/images/products/{fileName}");
                }
            }

            return Ok(urls);
        }
    }
}