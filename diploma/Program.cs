using diploma.business.Extensions;
using diploma.business.Services;
using diploma.dal;
using diploma;

var builder = WebApplication.CreateBuilder(args);

// 🔐 Вмикаємо HTTP + HTTPS
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5000);
    options.ListenLocalhost(7001, listen => listen.UseHttps());
});

// 3. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
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
app.UseStaticFiles();
app.UseHttpsRedirection();
// Важливо: додайте Authentication перед Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
await app.UseDefaultAdmin();

app.Run();