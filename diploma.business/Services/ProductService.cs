using diploma.core.Entities;
using diploma.dal;
using Microsoft.EntityFrameworkCore;

namespace diploma.business.Services
{
    public class ProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

  
        public async Task UpdateProductAsync(Product product)
        {
            var existingProduct = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            if (existingProduct != null)
            {
       
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.Materials = product.Materials;
                existingProduct.AvailableSizes = product.AvailableSizes;

              
                if (product.Photos.Any())
                {
                    existingProduct.Photos = product.Photos;
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}