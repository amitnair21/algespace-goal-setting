using Microsoft.Net.Http.Headers;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using webapi.AuthHelpers;
using webapi.Authorization;
using webapi.Services;
using webapi.Data;                  // ← make sure your DbContext lives here

var builder = WebApplication.CreateBuilder(args);
var config  = builder.Configuration;

// 1. Framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. SQLite + EF-Core
builder.Services.AddDbContext<MyDbContext>(opts =>
    opts.UseSqlite(
        config.GetConnectionString("DefaultConnection")
    )
);

// 3. CORS policies
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
        policy
            .WithMethods("GET","PUT","POST")
            .WithHeaders(
                HeaderNames.Accept,
                HeaderNames.ContentType,
                HeaderNames.Authorization,
                Settings.ApiKeyHeaderName
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
                !string.IsNullOrWhiteSpace(origin)
                && origin.StartsWith("http://localhost:5173", StringComparison.OrdinalIgnoreCase)
            )
    );

    options.AddPolicy("ProductionPolicy", policy =>
        policy
            .WithMethods("GET","PUT","POST")
            .WithHeaders(
                HeaderNames.Accept,
                HeaderNames.ContentType,
                HeaderNames.Authorization,
                Settings.ApiKeyHeaderName
            )
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
                !string.IsNullOrWhiteSpace(origin)
                // TODO: replace with your real frontend URL
                && origin.StartsWith("https://your-frontend-app.netlify.app", StringComparison.OrdinalIgnoreCase)
            )
    );
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

// 5. API-key settings & app services
builder.Services.Configure<AuthSettings>(
    config.GetSection("AuthSettings")
);
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
builder.Services.AddScoped<IFlexibilityExerciseService, FlexibilityExerciseService>();
builder.Services.AddScoped<ICKStudyService, CKStudyService>();
builder.Services.AddScoped<IFlexibilityStudyService, FlexibilityStudyService>();

// 6. Sanity-check log
var connString = config.GetConnectionString("DefaultConnection");
Console.WriteLine($"[Startup] SQLite DB path: {connString}");

var app = builder.Build();

// 7. (Optional) Auto-create/migrate the SQLite DB if it doesn’t exist
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    db.Database.EnsureCreated();
}

// 8. Middleware pipeline
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
