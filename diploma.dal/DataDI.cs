using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.dal
{
    public static class DataDI
    {
        public static IServiceCollection RegisterDataDependecies(this IServiceCollection services, IConfiguration config)

        {
            return services;
        }

    }
}
