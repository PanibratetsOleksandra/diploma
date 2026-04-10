using diploma.core.Entities;
using Microsoft.AspNetCore.Identity;

namespace diploma
{
    public static class RoleSeeder
    {
        public static async Task<WebApplication?> UseDefaultAdmin(this WebApplication? app)
        {
            if (app == null) return app;
            using IServiceScope scope = app.Services.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

            // 1. Створюємо роль, якщо її немає
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // 2. Призначаємо роль тобі
            var adminEmail = "opanibratec@gmail.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser != null && !await userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            return app;
        }

    }
}
