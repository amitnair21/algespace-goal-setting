# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy and restore
COPY ./webapi/*.csproj ./webapi/
RUN dotnet restore ./webapi/webapi.csproj

# Copy everything else
COPY ./webapi/ ./webapi/
WORKDIR /src/webapi

# Build and publish
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
