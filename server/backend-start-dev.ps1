# Backend Start Script - Start Containers and Restore Database
param(
    [string]$BackupFile = $null,
    [switch]$RestoreLatest = $false,
    [switch]$SkipRestore = $false
)

Write-Host "🚀 Starting backend services..." -ForegroundColor Green

# Start Docker Compose services
Write-Host "🐳 Starting Docker Compose services..." -ForegroundColor Cyan
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
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
            
            # Check if API container is already running (shouldn't be during startup, but just in case)
            $apiContainer = docker ps --filter "name=server-therapist-diary-api-1" --format "table {{.Names}}" | Select-String "server-therapist-diary-api-1"
            
            if ($apiContainer) {
                # If API is running, use the restore-backup.ps1 script which handles stopping/starting API
                Write-Host "🔄 Using restore script (API container detected)..." -ForegroundColor Yellow
                & ".\restore-backup.ps1" -BackupFileName $backupFileName
            } else {
                # Direct restore since API is not running yet
                $containerBackupPath = "/var/opt/mssql/backup/$backupFileName"
                
                try {
                    # Since backup directory is mounted, file should already be available
                    # But let's ensure it exists in the container
                    if (-not (Test-Path $backupToRestore)) {
                        Write-Host "❌ Backup file not found: $backupToRestore" -ForegroundColor Red
                        exit 1
                    }
                    
                    # Check if database exists and drop it if it does
                    $checkDbCommand = "IF EXISTS (SELECT name FROM sys.databases WHERE name = 'TherapistDiaryDb') DROP DATABASE [TherapistDiaryDb]"
                    docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "$checkDbCommand" -C
                    
                    # Restore database
                    $restoreCommand = "RESTORE DATABASE [TherapistDiaryDb] FROM DISK = '$containerBackupPath' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 10"
                    docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "$restoreCommand" -C
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Database restored successfully!" -ForegroundColor Green
                    } else {
                        Write-Host "❌ Database restore failed" -ForegroundColor Red
                    }
                }
                catch {
                    Write-Host "❌ Error during restore process: $($_.Exception.Message)" -ForegroundColor Red
                }
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
    
    # Test API endpoint (compatible with Windows 10 and 11)
    try {
        # Check PowerShell version and use appropriate method
        if ($PSVersionTable.PSVersion.Major -ge 6) {
            # PowerShell 7+ - use SkipCertificateCheck
            $response = Invoke-WebRequest -Uri "https://localhost:5000/health" -SkipCertificateCheck -TimeoutSec 10 -ErrorAction SilentlyContinue
        } else {
            # Windows PowerShell 5.1 - use modern approach with fallback
            try {
                # Try modern ServerCertificateValidationCallback first
                if (-not ([System.Management.Automation.PSTypeName]'TrustAllCertsPolicy').Type) {
                    try {
                        add-type @"
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy {
    public static bool ValidationCallback(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) {
        return true;
    }
}
"@
                    }
                    catch {
                        # If modern approach fails, fall back to simpler method
                        Write-Host "⚠️ Using fallback SSL handling for this system" -ForegroundColor Yellow
                    }
                }
                
                if (([System.Management.Automation.PSTypeName]'TrustAllCertsPolicy').Type) {
                    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = [TrustAllCertsPolicy]::ValidationCallback
                }
                [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
                $response = Invoke-WebRequest -Uri "https://localhost:5000/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
            }
            catch {
                # If HTTPS fails completely, try HTTP directly
                Write-Host "⚠️ HTTPS failed, trying HTTP directly..." -ForegroundColor Yellow
                $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
            }
        }
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API is responding successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ API responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "🔍 Trying HTTP endpoint..." -ForegroundColor Gray
        
        # Fallback to HTTP if HTTPS fails
        try {
            $httpResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($httpResponse.StatusCode -eq 200) {
                Write-Host "✅ API responding on HTTP (HTTPS redirect working)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️ Both HTTPS and HTTP health checks failed, but container is running" -ForegroundColor Yellow
        }
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
