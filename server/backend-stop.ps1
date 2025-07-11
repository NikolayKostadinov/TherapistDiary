# Backend Stop Script - Backup Database and Stop Containers
param(
    [string]$BackupName = "therapist-diary-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "🛑 Stopping backend services and creating database backup..." -ForegroundColor Yellow

# Check if containers are running
$runningContainers = docker ps --filter "name=server-" --format "{{.Names}}"

if (-not $runningContainers) {
    Write-Host "⚠️ No backend containers are running." -ForegroundColor Yellow
    exit 0
}

Write-Host "📋 Found running containers: $($runningContainers -join ', ')" -ForegroundColor Green

# Create backups directory if it doesn't exist
$backupsDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir -Force | Out-Null
    Write-Host "📁 Created backups directory: $backupsDir" -ForegroundColor Green
}

# Check if SQL Server container is running
$sqlContainer = docker ps --filter "name=server-sql-server-1" --format "{{.Names}}"

if ($sqlContainer) {
    Write-Host "💾 Creating database backup..." -ForegroundColor Cyan
    
    # Create backup inside the container
    $backupPath = "/var/opt/mssql/backup/$BackupName.bak"
    $backupCommand = "BACKUP DATABASE [TherapistDiaryDb] TO DISK = '$backupPath' WITH FORMAT, INIT, NAME = 'TherapistDiary Full Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
    
    try {
        # Execute backup command
        docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "$backupCommand" -C
        
        if ($LASTEXITCODE -eq 0) {
            # Copy backup file from container to host
            $hostBackupPath = Join-Path $backupsDir "$BackupName.bak"
            docker cp "server-sql-server-1:$backupPath" $hostBackupPath
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database backup created successfully: $hostBackupPath" -ForegroundColor Green
                
                # Clean up backup file from container
                docker exec server-sql-server-1 rm -f $backupPath
            } else {
                Write-Host "❌ Failed to copy backup file from container" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Database backup failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error during backup process: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ SQL Server container not found - skipping backup" -ForegroundColor Yellow
}

# Stop all containers
Write-Host "🛑 Stopping Docker Compose services..." -ForegroundColor Cyan
docker compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend services stopped successfully" -ForegroundColor Green
    
    # Clean up unused volumes (optional)
    Write-Host "🧹 Cleaning up unused Docker resources..." -ForegroundColor Cyan
    docker system prune -f --volumes
    
    Write-Host "🎉 Backend shutdown completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to stop some services" -ForegroundColor Red
    exit 1
}
