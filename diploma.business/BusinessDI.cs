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

        // 4. Ваші кастомні сервіси
        services.AddScoped<TokenService>();

        return services;
    }
}