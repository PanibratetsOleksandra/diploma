using diploma.business.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace diploma.business.Extensions;

public static class BusinessDI
{
    public static IServiceCollection RegisterBusinessDependecies(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<TokenService>();
        return services;
    }

}