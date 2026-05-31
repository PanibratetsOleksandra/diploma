using diploma.core;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Photos) 
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            return product;
        }

   
        [HttpPost]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            
            if (product.Photos != null && product.Photos.Any())
            {
                foreach (var photo in product.Photos)
                {
                   
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

        
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();

   
            var dbProduct = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (dbProduct == null) return NotFound();

        
            _context.Entry(dbProduct).CurrentValues.SetValues(product);
            dbProduct.AvailableSizes = product.AvailableSizes; 

          
            foreach (var dbPhoto in dbProduct.Photos.ToList())
            {
                if (!product.Photos.Any(p => p.Id == dbPhoto.Id))
                {
                    _context.ProductPhotos.Remove(dbPhoto);                }
            }

        
            foreach (var incomingPhoto in product.Photos)
            {
                var dbPhoto = dbProduct.Photos.FirstOrDefault(p => p.Id == incomingPhoto.Id && p.Id != 0);

                if (dbPhoto != null)
                {
                  
                    _context.Entry(dbPhoto).CurrentValues.SetValues(incomingPhoto);
                }
                else
                {
                  
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


        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.ADMIN)]
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
      
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");

            if (!Directory.Exists(path)) Directory.CreateDirectory(path);

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
              
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var fullPath = Path.Combine(path, fileName);

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

           
                  urls.Add($"/images/products/{fileName}");
                }
            }

            return Ok(urls);
        }
    }
}