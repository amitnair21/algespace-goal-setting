# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy and restore the csproj
COPY webapi/*.csproj ./webapi/
RUN dotnet restore ./webapi/webapi.csproj

# 🛠 FIX: copy the *contents* of webapi, not the folder itself
COPY webapi/ ./webapi/

WORKDIR /src/webapi
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
