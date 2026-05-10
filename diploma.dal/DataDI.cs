using diploma.core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics; 
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace diploma.dal
{
    public static class DataDI
    {
        public static IServiceCollection RegisterDataDependecies(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite(
                    config.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("diploma.dal")
                );

                options.ConfigureWarnings(warnings =>
                    warnings.Ignore(RelationalEventId.AmbientTransactionWarning));
            });

            services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            return services;
        }
    }
}