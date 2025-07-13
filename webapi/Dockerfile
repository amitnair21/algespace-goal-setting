# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy project file and restore dependencies
COPY webapi.csproj ./
RUN dotnet restore

# 2. Copy all source files and publish the app
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# 3. Copy the published output
COPY --from=build /app/publish .

# 4. Copy the SQLite database into Render’s persistent volume
#    Adjust the source path if your .db lives elsewhere in the repo
COPY --from=build /src/Data/databases/algespace.db /opt/render/data/algespace.db

EXPOSE 80

# 5. Launch the application
ENTRYPOINT ["dotnet", "webapi.dll"]
