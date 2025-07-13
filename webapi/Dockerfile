# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy only the project file and restore
COPY *.csproj ./
RUN dotnet restore webapi.csproj

# 2. Copy the rest of the source and publish
COPY . ./
RUN dotnet publish webapi.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 3. Grab the published output
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "webapi.dll"]
