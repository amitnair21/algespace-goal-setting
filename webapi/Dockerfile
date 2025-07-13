# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy project and restore
COPY *.csproj ./
RUN dotnet restore

# 2. Copy all source, including your Data folder
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 3. Copy published output
COPY --from=build /app/publish .

# 4. Copy the SQLite file into a writable volume folder
#    Render mounts /opt/render/data as persistent storage
COPY --from=build /src/Data/databases/algespace.db /opt/render/data/algespace.db

# 5. Expose and run
EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
