using Microsoft.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using webapi.AuthHelpers;
using webapi.Authorization;
using webapi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ─── Register your SQLite DbContext ──────────────────────────────────────
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ─── CORS Policies ────────────────────────────────────────────────────────
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
                Settings.ApiKeyHeaderName
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                return origin.ToLower().StartsWith("http://localhost:5173");
            });
    });

    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy
            .WithMethods("GET", "PUT", "POST")
            .WithHeaders(
                HeaderNames.Accept,
                HeaderNames.ContentType,
                HeaderNames.Authorization,
                Settings.ApiKeyHeaderName
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                // Replace with your actual frontend URL
                return origin.ToLower().StartsWith("https://your-frontend-app.netlify.app");
            });
    });
});

// ─── Rate Limiting ────────────────────────────────────────────────────────
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

// ─── Auth Settings & Your Services ───────────────────────────────────────
builder.Services.Configure<AuthSettings>(
    builder.Configuration.GetSection("AuthSettings")
);

builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();
builder.Services.AddScoped<ICKStudyService, CKStudyService>();
builder.Services.AddScoped<IFlexibilityStudyService, FlexibilityStudyService>();

// ─── Log the connection string for sanity check ───────────────────────────
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[Startup] SQLite DB path: {connString}");

var app = builder.Build();

// ─── Middleware Pipeline ─────────────────────────────────────────────────
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
