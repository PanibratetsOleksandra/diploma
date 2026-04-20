using diploma.core.Enums;
using System.ComponentModel.DataAnnotations;
namespace diploma.core.Entities
{
        public class Product
        {
            public int Id { get; set; }

            [Required]
            [MaxLength(100)]
            public string Name { get; set; } = string.Empty;

            [Required]
            [MaxLength(1000)]
            public string Description { get; set; } = string.Empty;

            [Required]
            public string Materials { get; set; } = string.Empty; // Наприклад: "100% бавовна"

            public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // Список доступних розмірів для цієї моделі
        public List<ProductSize> AvailableSizes { get; set; } = new();

            // Зв'язок із фотографіями
            public List<ProductPhoto> Photos { get; set; } = new();
        }    
}
