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

// 2. Grab both connection‐string env-vars
//    (Set these in Render’s Dashboard → Environment)
var exConn   = config.GetConnectionString("DefaultConnection");  // algespace.db
var studyConn = config.GetConnectionString("StudiesConnection"); // studies.db

Console.WriteLine($"[Startup] exConn = {exConn}");
Console.WriteLine($"[Startup] studyConn = {studyConn}");

// 3. Register exercise DB for all ICKExerciseService injections
builder.Services.AddTransient<IDbConnection>(_ => new SQLiteConnection(exConn));

// 4. Register your exercise & flexibility-exercise services
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();

// 5. Register studies services using a second SQLiteConnection
builder.Services.AddScoped<ICKStudyService>(sp =>
{
    return new CKStudyService(new SQLiteConnection(studyConn));
});
builder.Services.AddScoped<IFlexibilityStudyService>(sp =>
{
    return new FlexibilityStudyService(new SQLiteConnection(studyConn));
});

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

// 7. Rate limiting
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

// 8. AuthSettings + your API-key middleware
builder.Services.Configure<AuthSettings>(
    config.GetSection("AuthSettings")
);

var app = builder.Build();

// 9. Health-check endpoint (verifies both DBs are reachable)
app.MapGet("/health", () =>
{
    var results = new Dictionary<string, object>();
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
            var tables = c.ExecuteScalar<int>(
              "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
            );
            results[name] = $"OK ({tables} tables)";
        }
        catch (Exception ex)
        {
            results[name] = $"ERROR ({ex.Message})";
        }
    }
    return Results.Ok(results);
});

// 10. Controllers + global exception logging
app.MapControllers();

app.Use(async (ctx, next) =>
{
    try { await next(); }
    catch (Exception ex)
    {
        Console.Error.WriteLine(ex);
        ctx.Response.StatusCode = 500;
        await ctx.Response.WriteAsync(ex.Message);
    }
});

// 11. Middleware pipeline
app.UseRateLimiter();
app.UseCors("ProductionPolicy");
app.UseMiddleware<ApiKeyMiddleware>();
app.UseHttpsRedirection();

app.Run();
