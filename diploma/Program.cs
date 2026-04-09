using diploma.business.Extensions;
using diploma.business.Services;
using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Identity; // Підключаємо наш новий клас

var builder = WebApplication.CreateBuilder(args);

// 🔐 Вмикаємо HTTP + HTTPS
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5000);
    options.ListenLocalhost(7001, listen => listen.UseHttps());
});

// Викликаємо наш статичний метод розширення
builder.Services.RegisterBusinessDependecies(builder.Configuration);
builder.Services.RegisterDataDependecies(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<ProductService>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();

// Важливо: додайте Authentication перед Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
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
}
app.Run();