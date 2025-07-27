# Backend Demo Script - Stop Demo Environment
param(
    [switch]$RemoveVolumes = $false,
    [switch]$RemoveImages = $false,
    [switch]$Force = $false
)

Write-Host "🛑 Stopping demo backend services..." -ForegroundColor Yellow

# Stop and remove containers using demo compose file
Write-Host "🐳 Stopping Demo Docker Compose services..." -ForegroundColor Cyan

if ($RemoveVolumes) {
    Write-Host "⚠️ This will also remove volumes (database data will be lost)..." -ForegroundColor Red
    if (-not $Force) {
        $confirmation = Read-Host "Are you sure you want to remove volumes? Type 'yes' to confirm"
        if ($confirmation -ne 'yes') {
            Write-Host "❌ Operation cancelled" -ForegroundColor Red
            exit 1
        }
    }
    docker compose -f docker-compose.demo.yml down -v
} else {
    docker compose -f docker-compose.demo.yml down
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to stop Docker services" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Demo containers stopped successfully!" -ForegroundColor Green

# Remove images if requested
if ($RemoveImages) {
    Write-Host "🗑️ Removing Docker images..." -ForegroundColor Cyan
    
    # Remove the therapist diary images
    docker image rm nikihattan/therapist-diary-be:latest 2>$null
    
    if ($Force) {
        # Force remove SQL Server image as well
        docker image rm mcr.microsoft.com/mssql/server:2022-latest 2>$null
        Write-Host "✅ All images removed (forced)" -ForegroundColor Green
    } else {
        Write-Host "✅ Demo application images removed" -ForegroundColor Green
        Write-Host "💡 SQL Server image kept for faster future startups" -ForegroundColor Gray
    }
}

# Show remaining containers
$remainingContainers = docker ps -a --filter "name=server-" --format "{{.Names}}"
if ($remainingContainers) {
    Write-Host "⚠️ Some containers still exist (stopped):" -ForegroundColor Yellow
    docker ps -a --filter "name=server-" --format "table {{.Names}}\t{{.Status}}"
    
    if ($Force) {
        Write-Host "🗑️ Force removing all related containers..." -ForegroundColor Red
        docker ps -a --filter "name=server-" -q | ForEach-Object { docker rm $_ }
        Write-Host "✅ All containers removed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No remaining containers" -ForegroundColor Green
}

# Show Docker system status
Write-Host "`n📊 Docker system overview:" -ForegroundColor Cyan
docker system df

Write-Host "`n🎉 Demo backend shutdown completed!" -ForegroundColor Green
Write-Host "💡 Next time you can start quickly with 'backend-start-demo.ps1'" -ForegroundColor Cyan

Write-Host "`n💡 Shutdown Options Available:" -ForegroundColor Cyan
Write-Host "  • Normal stop: ./backend-stop-demo.ps1" -ForegroundColor Gray
Write-Host "  • Remove volumes: ./backend-stop-demo.ps1 -RemoveVolumes" -ForegroundColor Gray
Write-Host "  • Remove images: ./backend-stop-demo.ps1 -RemoveImages" -ForegroundColor Gray
Write-Host "  • Force cleanup: ./backend-stop-demo.ps1 -Force -RemoveVolumes -RemoveImages" -ForegroundColor Gray
