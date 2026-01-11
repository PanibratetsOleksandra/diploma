using diploma.business.Services;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace diploma.business.Extensions;

public static class BusinessDI
{
    public static IServiceCollection RegisterBusinessDependecies(this IServiceCollection services, IConfiguration config)
    {
        // 1. База даних (SQLite)
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(config.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("diploma.dal")));

        // 2. Identity
        services.AddIdentity<AppUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        // 3. CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", policy =>
            {
                policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // 4. Ваші кастомні сервіси
        services.AddScoped<TokenService>();

        return services;
    }
}