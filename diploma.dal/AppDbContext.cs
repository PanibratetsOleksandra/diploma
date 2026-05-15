using diploma.core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace diploma.dal
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductPhoto> ProductPhotos { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<SavedDesign> SavedDesigns { get; set; }

        public DbSet<UserDesign> UserDesigns { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<GarmentPrice> GarmentPrices { get; set; }
    }
}
