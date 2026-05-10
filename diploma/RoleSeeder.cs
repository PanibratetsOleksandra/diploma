using diploma.core;
using diploma.core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration; 

namespace diploma
{
    public static class RoleSeeder
    {
        public static async Task<WebApplication?> SeedIdentityDataAsync(this WebApplication? app)
        {
            if (app == null) return app;
            using IServiceScope scope = app.Services.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();


            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();


            if (!await roleManager.RoleExistsAsync(Roles.ADMIN))
            {
                await roleManager.CreateAsync(new IdentityRole(Roles.ADMIN));
            }


            if (!await roleManager.RoleExistsAsync(Roles.USER))
            {
                await roleManager.CreateAsync(new IdentityRole(Roles.USER));
            }


            var adminEmail = configuration["AdminSettings:Email"];
            var defaultPassword = configuration["AdminSettings:DefaultPassword"];
            if (adminEmail is null) throw new InvalidOperationException(nameof(adminEmail));
            if (defaultPassword is null) throw new InvalidOperationException(nameof(defaultPassword));
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser != null)
            {
                return app;
            }

            adminUser = new AppUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Sasha Panibratets",
                EmailConfirmed = true
            };


            var createResult = await userManager.CreateAsync(adminUser, defaultPassword);

            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.ADMIN);
            }
            else
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Не вдалося створити дефолтного адміна з конфігурації: {errors}");
            }

            return app;
        }
    }
}