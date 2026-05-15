
namespace diploma.core.Entities
{
    public class GarmentPrice
    {
        public int Id { get; set; }

        public string GarmentType { get; set; } = null!;

        public decimal BasePrice { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}