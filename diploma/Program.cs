using diploma.business.Extensions;
using diploma.business.Services;
using diploma.dal;
using diploma;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
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

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["TokenKey"]!)
        ),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();


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