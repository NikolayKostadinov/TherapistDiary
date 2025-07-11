# Backend Start Script - Start Containers and Restore Database
param(
    [string]$BackupFile = $null,
    [switch]$RestoreLatest = $false,
    [switch]$SkipRestore = $false
)

Write-Host "🚀 Starting backend services..." -ForegroundColor Green

# Build and start Docker Compose services (rebuild API for fresh deployment)
Write-Host "� Building and starting Docker Compose services..." -ForegroundColor Cyan
Write-Host "📦 Rebuilding therapist-diary-api for fresh deployment..." -ForegroundColor Yellow
docker compose up -d --build therapist-diary-api

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build and start Docker services" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for SQL Server to be ready..." -ForegroundColor Yellow

# Wait for SQL Server to be healthy
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    Start-Sleep 5
    
    $healthStatus = docker inspect server-sql-server-1 --format '{{.State.Health.Status}}' 2>$null
    
    Write-Host "Attempt $attempt/$maxAttempts - SQL Server status: $healthStatus" -ForegroundColor Gray
    
    if ($healthStatus -eq "healthy") {
        Write-Host "✅ SQL Server is ready!" -ForegroundColor Green
        break
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "❌ SQL Server failed to become healthy within timeout" -ForegroundColor Red
        exit 1
    }
} while ($true)

# Database restoration logic
if (-not $SkipRestore) {
    $backupsDir = Join-Path $PSScriptRoot "backups"
    
    if (Test-Path $backupsDir) {
        $backupToRestore = $null
        
        if ($BackupFile) {
            # Use specified backup file
            if (Test-Path $BackupFile) {
                $backupToRestore = $BackupFile
                Write-Host "📁 Using specified backup file: $BackupFile" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Specified backup file not found: $BackupFile" -ForegroundColor Red
                exit 1
            }
        } elseif ($RestoreLatest) {
            # Find latest backup file
            $latestBackup = Get-ChildItem $backupsDir -Filter "*.bak" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            
            if ($latestBackup) {
                $backupToRestore = $latestBackup.FullName
                Write-Host "📁 Using latest backup file: $($latestBackup.Name)" -ForegroundColor Cyan
            } else {
                Write-Host "⚠️ No backup files found in $backupsDir" -ForegroundColor Yellow
            }
        } else {
            # Interactive selection
            $backupFiles = Get-ChildItem $backupsDir -Filter "*.bak" | Sort-Object LastWriteTime -Descending
            
            if ($backupFiles.Count -gt 0) {
                Write-Host "📁 Available backup files:" -ForegroundColor Cyan
                for ($i = 0; $i -lt $backupFiles.Count; $i++) {
                    Write-Host "  [$i] $($backupFiles[$i].Name) - $($backupFiles[$i].LastWriteTime)" -ForegroundColor Gray
                }
                Write-Host "  [s] Skip restore" -ForegroundColor Gray
                
                $selection = Read-Host "Select backup to restore (0-$($backupFiles.Count-1) or 's' to skip)"
                
                if ($selection -eq 's' -or $selection -eq 'S') {
                    Write-Host "⏭️ Skipping database restore" -ForegroundColor Yellow
                } elseif ($selection -match '^\d+$' -and [int]$selection -lt $backupFiles.Count) {
                    $backupToRestore = $backupFiles[[int]$selection].FullName
                    Write-Host "📁 Selected backup: $($backupFiles[[int]$selection].Name)" -ForegroundColor Cyan
                } else {
                    Write-Host "❌ Invalid selection" -ForegroundColor Red
                    exit 1
                }
            } else {
                Write-Host "⚠️ No backup files found in $backupsDir" -ForegroundColor Yellow
            }
        }
        
        # Perform restoration if backup file is selected
        if ($backupToRestore) {
            Write-Host "💾 Restoring database from backup..." -ForegroundColor Cyan
            
            $backupFileName = Split-Path $backupToRestore -Leaf
            $containerBackupPath = "/var/opt/mssql/backup/$backupFileName"
            
            try {
                # Copy backup file to container
                docker cp $backupToRestore "server-sql-server-1:$containerBackupPath"
                
                if ($LASTEXITCODE -eq 0) {
                    # Check if database exists and drop it if it does
                    $checkDbCommand = "IF EXISTS (SELECT name FROM sys.databases WHERE name = 'TherapistDiaryDb') DROP DATABASE [TherapistDiaryDb]"
                    docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "$checkDbCommand" -C
                    
                    # Restore database
                    $restoreCommand = "RESTORE DATABASE [TherapistDiaryDb] FROM DISK = '$containerBackupPath' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 10"
                    docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "$restoreCommand" -C
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Database restored successfully!" -ForegroundColor Green
                        
                        # Clean up backup file from container
                        docker exec server-sql-server-1 rm -f $containerBackupPath
                    } else {
                        Write-Host "❌ Database restore failed" -ForegroundColor Red
                    }
                } else {
                    Write-Host "❌ Failed to copy backup file to container" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "❌ Error during restore process: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "⚠️ Backups directory not found: $backupsDir" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Skipping database restore (SkipRestore flag set)" -ForegroundColor Yellow
}

# Wait for API to be ready
Write-Host "⏳ Waiting for API to be ready..." -ForegroundColor Yellow
Start-Sleep 10

$apiContainer = docker ps --filter "name=server-therapist-diary-api-1" --format "{{.Names}}"
if ($apiContainer) {
    Write-Host "✅ API container is running" -ForegroundColor Green
    
    # Test API endpoint
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:5000/api/health" -SkipCertificateCheck -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API is responding successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ API responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ API health check failed, but container is running" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ API container failed to start" -ForegroundColor Red
}

Write-Host "🎉 Backend startup completed!" -ForegroundColor Green
Write-Host "📍 API URL: https://localhost:5000" -ForegroundColor Cyan
Write-Host "📍 SQL Server: localhost:1433" -ForegroundColor Cyan

# Show running containers
Write-Host "`n📋 Running containers:" -ForegroundColor Cyan
docker ps --filter "name=server-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
