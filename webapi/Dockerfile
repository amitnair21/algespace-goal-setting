# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY webapi.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 1) Copy the published DLLs
COPY --from=build /app/publish .  

# 2) Copy your SQLite files side-by-side under /app/Data/databases
#    (adjust the source path if your .db files live elsewhere in your repo)
RUN mkdir -p Data/databases
COPY --from=build /src/Data/databases/algespace.db Data/databases/algespace.db
COPY --from=build /src/Data/databases/studies.db   Data/databases/studies.db

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
