using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
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

// 2. Read your two connection strings from Render env‐vars
//    – DefaultConnection → algespace.db
//    – StudiesConnection → studies.db
var exConn    = config.GetConnectionString("DefaultConnection");
var studyConn = config.GetConnectionString("StudiesConnection");
Console.WriteLine($"[Startup] DefaultConnection = {exConn}");
Console.WriteLine($"[Startup] StudiesConnection = {studyConn}");

// 3. Register the SQLite connection for exercise services
builder.Services.AddTransient<IDbConnection>(_ => new SQLiteConnection(exConn));

// 4. Exercise services (use the above connection)
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();

// 5. Study services (use ActivatorUtilities to inject any extra ctor args)
builder.Services.AddScoped<ICKStudyService>(sp =>
    ActivatorUtilities.CreateInstance<CKStudyService>(
        sp,
        new SQLiteConnection(studyConn)
    )
);
builder.Services.AddScoped<IFlexibilityStudyService>(sp =>
    ActivatorUtilities.CreateInstance<FlexibilityStudyService>(
        sp,
        new SQLiteConnection(studyConn)
    )
);

// 6. CORS policy (allow your Netlify front-end)
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

// 7. Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.User.Identity?.Name 
                          ?? ctx.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit       = 1000,
                QueueLimit        = 0,
                Window            = TimeSpan.FromMinutes(1)
            })
    );
});

// 8. Auth settings
builder.Services.Configure<AuthSettings>(
    config.GetSection("AuthSettings")
);

var app = builder.Build();

// 9. Health-check endpoint for both databases
app.MapGet("/health", () =>
{
    var results = new Dictionary<string, string>();

    foreach ((string name, string cs) in new[]
    {
        ("algespace",   exConn),
        ("studies",     studyConn)
    })
    {
        try
        {
            using var c = new SQLiteConnection(cs);
            c.Open();
            var t = c.ExecuteScalar<int>(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
            );
            results[name] = $"OK ({t} tables)";
        }
        catch (Exception ex)
        {
            results[name] = $"ERROR ({ex.Message})";
        }
    }

    return Results.Ok(results);
});

// 10. Global exception logger
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

// 11. Middleware pipeline
app.UseRateLimiter();
app.UseCors("ProductionPolicy");
app.UseMiddleware<ApiKeyMiddleware>();
app.UseHttpsRedirection();

app.MapControllers();
app.Run();
