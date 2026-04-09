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

        // Метод для оновлення товару
        public async Task UpdateProductAsync(Product product)
        {
            var existingProduct = await _context.Products
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            if (existingProduct != null)
            {
                // Оновлюємо поля
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.Materials = product.Materials;
                existingProduct.AvailableSizes = product.AvailableSizes;

                // Оновлюємо фото (якщо прийшло нове)
                if (product.Photos.Any())
                {
                    existingProduct.Photos = product.Photos;
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}