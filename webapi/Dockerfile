# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy project file + restore
COPY webapi.csproj ./
RUN dotnet restore

# 2. Copy source + publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 3. Copy published output
COPY --from=build /app/publish .

# 4. Copy BOTH of your SQLite files into Render’s data folder
COPY --from=build /src/Data/databases/algespace.db /opt/render/data/algespace.db
COPY --from=build /src/Data/databases/studies.db   /opt/render/data/studies.db

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
