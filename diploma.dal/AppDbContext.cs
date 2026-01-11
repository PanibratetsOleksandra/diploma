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

        //// Ваши существующие DbSet (Products, Orders и т.д.)
        //public DbSet<Product> Products { get; set; }
    }
}
