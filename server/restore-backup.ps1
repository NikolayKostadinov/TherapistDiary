# Restore database from backup script
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFileName
)

Write-Host "📋 Restoring database from backup: $BackupFileName" -ForegroundColor Cyan

# Check if backup file exists
$backupPath = ".\backups\$BackupFileName"
if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup file not found: $backupPath" -ForegroundColor Red
    Write-Host "Available backups:" -ForegroundColor Yellow
    if (Test-Path ".\backups") {
        Get-ChildItem ".\backups" -Filter "*.bak" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "  No backups directory found." -ForegroundColor Gray
    }
    exit 1
}

# Check if SQL Server container is running
$sqlContainer = docker ps --filter "name=server-sql-server-1" --format "table {{.Names}}" | Select-String "server-sql-server-1"

if (-not $sqlContainer) {
    Write-Host "❌ SQL Server container is not running. Please start the services first." -ForegroundColor Red
    exit 1
}

# Check if API container is running and stop it
$apiContainer = docker ps --filter "name=server-therapist-diary-api-1" --format "table {{.Names}}" | Select-String "server-therapist-diary-api-1"
$apiWasRunning = $false

if ($apiContainer) {
    Write-Host "🛑 Stopping API container to prevent database conflicts..." -ForegroundColor Yellow
    docker stop server-therapist-diary-api-1
    if ($LASTEXITCODE -eq 0) {
        $apiWasRunning = $true
        Write-Host "✅ API container stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Failed to stop API container, continuing anyway..." -ForegroundColor Yellow
    }
}

# Copy backup file to container
Write-Host "📁 Copying backup file to container..." -ForegroundColor Yellow

# Since backup directory is mounted, file should already be available, but let's verify
$containerBackupPath = "/var/opt/mssql/backup/$BackupFileName"

# Check if file exists in container
$fileCheck = docker exec server-sql-server-1 ls $containerBackupPath 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backup file not found in container: $containerBackupPath" -ForegroundColor Red
    Write-Host "Available files in backup directory:" -ForegroundColor Yellow
    docker exec server-sql-server-1 ls -la /var/opt/mssql/backup/
    
    # If restore failed and we stopped the API, try to restart it
    if ($apiWasRunning) {
        Write-Host "🔄 Attempting to restart API container after failed file check..." -ForegroundColor Yellow
        docker start server-therapist-diary-api-1
    }
    exit 1
}

# Restore the database
Write-Host "🔄 Restoring database..." -ForegroundColor Yellow
$restoreResult = docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P P@ssw0rd -Q "RESTORE DATABASE [TherapistDiaryDb] FROM DISK = '$containerBackupPath' WITH REPLACE" -C

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database restored successfully!" -ForegroundColor Green
    
    # Restart API container if it was running
    if ($apiWasRunning) {
        Write-Host "🚀 Starting API container..." -ForegroundColor Cyan
        docker start server-therapist-diary-api-1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API container started successfully!" -ForegroundColor Green
            
            # Wait a moment for the container to fully start
            Write-Host "⏳ Waiting for API to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            # Check if API container is healthy
            $apiStatus = docker ps --filter "name=server-therapist-diary-api-1" --format "table {{.Status}}"
            if ($apiStatus -like "*Up*") {
                Write-Host "🎉 API is running and ready!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ API started but may need more time to be fully ready" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Failed to restart API container" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Failed to restore database" -ForegroundColor Red
    Write-Host $restoreResult -ForegroundColor Red
    
    # If restore failed and we stopped the API, try to restart it
    if ($apiWasRunning) {
        Write-Host "🔄 Attempting to restart API container after failed restore..." -ForegroundColor Yellow
        docker start server-therapist-diary-api-1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API container restarted" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to restart API container" -ForegroundColor Red
        }
    }
    exit 1
}
