# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy only the project file
COPY webapi.csproj ./

# 2. Install the EF-Core SQLite provider so UseSqlite(...) compiles
RUN dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.0

# 3. Restore all dependencies (now including SQLite)
RUN dotnet restore

# 4. Copy the rest of your code
COPY . ./

# 5. Publish your app
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 6. Copy published output
COPY --from=build /app/publish .

# 7. Copy the SQLite file into Render’s persistent data folder
COPY --from=build /src/Data/databases/algespace.db /opt/render/data/algespace.db

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
