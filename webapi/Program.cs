using Microsoft.Net.Http.Headers;
using System.Data;
using System.Data.SQLite;
using System.Threading.RateLimiting;
using webapi.AuthHelpers;
using webapi.Authorization;
using webapi.Services;
using Dapper;          // if you want Dapper; otherwise you can skip this

var builder = WebApplication.CreateBuilder(args);
var config  = builder.Configuration;

// 1. Framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Register a SQLite IDbConnection factory
var connString = config.GetConnectionString("DefaultConnection");
// this reads your env var: "Data Source=/opt/render/data/algespace.db"
builder.Services.AddTransient<IDbConnection>(_ => new SQLiteConnection(connString));

// 3. CORS, rate-limiting, API-key, AuthSettings, your app-services…
builder.Services.AddCors(…);
builder.Services.AddRateLimiter(…);
builder.Services.Configure<AuthSettings>(config.GetSection("AuthSettings"));
builder.Services.AddScoped<ICKExerciseService, CKExerciseService>();
// … other services …

var app = builder.Build();

// 4. Middleware pipeline
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
