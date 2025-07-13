# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy only the project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# 2. Copy all source files and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ─── Runtime Stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 3. Copy published output into the runtime image
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
