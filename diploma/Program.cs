using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);

// 🔐 Вмикаємо HTTP + HTTPS
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5000); // HTTP
    options.ListenLocalhost(7001, listen =>
    {
        listen.UseHttps(); // HTTPS
    });
});

// Controllers
builder.Services.AddControllers();

// CORS для Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Подключение SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString, b => b.MigrationsAssembly("diploma.dal")));
// ^^^ Важно: указываем, что миграции будут лежать в проекте DAL

// OpenAPI / Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// CORS
app.UseCors("AllowAngular");

// HTTPS redirect
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
