using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;
using System;
using System.Data;
using System.Data.SQLite;
using System.Threading.RateLimiting;
using Dapper;
using webapi.AuthHelpers;
using webapi.Authorization;
using webapi.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Register a SQLite IDbConnection factory
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
// Expect: Data Source=/opt/render/data/algespace.db
builder.Services.AddTransient<IDbConnection>(_ => new SQLiteConnection(connString));

// 3. CORS policies
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy
            .WithMethods("GET", "PUT", "POST")
            .WithHeaders(
                HeaderNames.Accept,
                HeaderNames.ContentType,
                HeaderNames.Authorization,
                "X-API-Key"
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
                !string.IsNullOrWhiteSpace(origin) &&
                origin.StartsWith("http://localhost:5173", StringComparison.OrdinalIgnoreCase)
            );
    });

    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy
            .WithMethods("GET", "PUT", "POST")
            .WithHeaders(
                HeaderNames.Accept,
                HeaderNames.ContentType,
                HeaderNames.Authorization,
                "X-API-Key"
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
                !string.IsNullOrWhiteSpace(origin) &&
                origin.StartsWith("https://algespace.netlify.app", StringComparison.OrdinalIgnoreCase)
            );
    });
});

// 4. Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name
                          ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit       = 1000,
                QueueLimit        = 0,
                Window            = TimeSpan.FromMinutes(1)
            }));
});

// 5. Auth settings & application services
builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthSettings")
);
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();
builder.Services.AddScoped<ICKStudyService, CKStudyService>();
builder.Services.AddScoped<IFlexibilityStudyService, FlexibilityStudyService>();

var app = builder.Build();

// 6. Middleware pipeline
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevelopmentPolicy");
}
else
{
    app.UseCors("ProductionPolicy");
    app.UseMiddleware<ApiKeyMiddleware>();
    app.UseHttpsRedirection();
}

app.MapControllers();
app.Run();
