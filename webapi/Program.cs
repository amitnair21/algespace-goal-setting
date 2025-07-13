using Microsoft.Net.Http.Headers;
using System;
using System.Data;
using System.Data.SQLite;
using System.Threading.RateLimiting;
using Dapper;
using webapi.AuthHelpers;
using webapi.Authorization;
using webapi.Services;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// 1. Basic services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Build absolute paths inside the container
//    AppContext.BaseDirectory == /app when published
var baseDir = AppContext.BaseDirectory;
var dataDir = Path.Combine(baseDir, "Data", "databases");
var exDb    = Path.Combine(dataDir, "algespace.db");
var studyDb = Path.Combine(dataDir, "studies.db");

Console.WriteLine($"[Startup] algespace.db exists? {File.Exists(exDb)}");
Console.WriteLine($"[Startup] studies.db exists?   {File.Exists(studyDb)}");

// 3. Register default IDbConnection for exercises
builder.Services.AddTransient<IDbConnection>(_ =>
    new SQLiteConnection($"Data Source={exDb}")
);

// 4. Exercise services
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();

// 5. Study services (using ActivatorUtilities to satisfy their ctors)
builder.Services.AddScoped<ICKStudyService>(sp =>
    ActivatorUtilities.CreateInstance<CKStudyService>(
        sp,
        new SQLiteConnection($"Data Source={studyDb}")
    )
);
builder.Services.AddScoped<IFlexibilityStudyService>(sp =>
    ActivatorUtilities.CreateInstance<FlexibilityStudyService>(
        sp,
        new SQLiteConnection($"Data Source={studyDb}")
    )
);

// 6. CORS
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

// 7. Rate Limiting & AuthSettings
builder.Services.AddRateLimiter(o =>
{
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext,string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.User.Identity?.Name 
                          ?? ctx.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions {
                AutoReplenishment = true,
                PermitLimit       = 1000,
                QueueLimit        = 0,
                Window            = TimeSpan.FromMinutes(1)
            }
        )
    );
});
builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthSettings")
);

var app = builder.Build();

// 8. Health endpoint to double-check tables
app.MapGet("/health", () =>
{
    using var c1 = new SQLiteConnection($"Data Source={exDb}");
    c1.Open();
    var t1 = c1.ExecuteScalar<int>("SELECT COUNT(*) FROM sqlite_master WHERE type='table';");

    using var c2 = new SQLiteConnection($"Data Source={studyDb}");
    c2.Open();
    var t2 = c2.ExecuteScalar<int>("SELECT COUNT(*) FROM sqlite_master WHERE type='table';");

    return Results.Ok(new { exercisesTables = t1, studiesTables = t2 });
});

// 9. Controllers + exception logging
app.Use(async (ctx,next) =>
{
    try { await next(); }
    catch(Exception ex)
    {
        Console.Error.WriteLine(ex);
        ctx.Response.StatusCode = 500;
        await ctx.Response.WriteAsync(ex.Message);
    }
});

app.UseRateLimiter();
app.UseCors("ProductionPolicy");
app.UseMiddleware<ApiKeyMiddleware>();
app.UseHttpsRedirection();

app.MapControllers();
app.Run();
