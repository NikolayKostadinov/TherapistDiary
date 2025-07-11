# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 5000
EXPOSE 5001


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/Presentation/TherapistDiary.WebAPI/TherapistDiary.WebAPI.csproj", "src/Presentation/TherapistDiary.WebAPI/"]
COPY ["src/Core/TherapistDiary.Domain/TherapistDiary.Domain.csproj", "src/Core/TherapistDiary.Domain/"]
COPY ["src/Common/TherapistDiary.Common/TherapistDiary.Common.csproj", "src/Common/TherapistDiary.Common/"]
COPY ["src/Infrastructure/TherapistDiary.Infrastructure/TherapistDiary.Infrastructure.csproj", "src/Infrastructure/TherapistDiary.Infrastructure/"]
COPY ["src/Core/TherapistDiary.Application/TherapistDiary.Application.csproj", "src/Core/TherapistDiary.Application/"]
COPY ["src/Infrastructure/TherapistDiary.Persistence/TherapistDiary.Persistence.csproj", "src/Infrastructure/TherapistDiary.Persistence/"]
RUN dotnet restore "./src/Presentation/TherapistDiary.WebAPI/TherapistDiary.WebAPI.csproj"
COPY . .
WORKDIR "/src/src/Presentation/TherapistDiary.WebAPI"
RUN dotnet build "./TherapistDiary.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./TherapistDiary.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TherapistDiary.WebAPI.dll"]