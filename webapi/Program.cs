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
var config  = builder.Configuration;

// 1. Framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. SQLite connection factory
builder.Services.AddTransient<IDbConnection>(_ =>
{
    var cs = config.GetConnectionString("DefaultConnection");
    Console.WriteLine($"[Startup] Using SQLite ConnectionString: {cs}");
    return new SQLiteConnection(cs);
});

// 3. CORS
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("ProductionPolicy", p =>
        p.WithOrigins("https://algespace.netlify.app")
         .WithMethods("GET","POST","PUT","OPTIONS")
         .WithHeaders(
           HeaderNames.Accept,
           HeaderNames.ContentType,
           HeaderNames.Authorization,
           "X-API-Key"
         )
         .AllowCredentials()
    );
});

// 4. Rate Limiting, AuthSettings, your services…
builder.Services.AddRateLimiter(o =>
{
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext,string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.User.Identity?.Name ?? ctx.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions {
                AutoReplenishment = true,
                PermitLimit       = 1000,
                QueueLimit        = 0,
                Window            = TimeSpan.FromMinutes(1)
            })
    );
});

builder.Services.Configure<AuthSettings>(
    config.GetSection("AuthSettings")
);
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();
builder.Services.AddScoped<ICKStudyService, CKStudyService>();
builder.Services.AddScoped<IFlexibilityStudyService, FlexibilityStudyService>();

var app = builder.Build();

// 5. Health‐check endpoint for SQLite
app.MapGet("/health", (IDbConnection db) =>
{
    try
    {
        db.Open();
        // check that at least one table exists
        var count = db.ExecuteScalar<int>(
          "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
        );
        return Results.Ok($"🎉 SQLite reachable, {count} tables found");
    }
    catch (Exception ex)
    {
        return Results.Problem($"🔴 DB error: {ex.Message}");
    }
});

// 6. Your real endpoints with error‐logging
app.MapControllers();

// We’ll decorate controllers to log exceptions instead of swallow them
app.Use(async (ctx, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[ERROR] {ex}");
        ctx.Response.StatusCode = 500;
        await ctx.Response.WriteAsync(ex.Message);
    }
});

// 7. Middleware pipeline
app.UseRateLimiter();
app.UseCors("ProductionPolicy");
app.UseMiddleware<ApiKeyMiddleware>();
app.UseHttpsRedirection();

app.Run();
