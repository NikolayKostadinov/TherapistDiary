# Create database backup script
param(
    [string]$BackupFileName = "therapist-diary-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').bak"
)

Write-Host "📋 Creating database backup: $BackupFileName" -ForegroundColor Cyan

# Check if SQL Server container is running
$sqlContainer = docker ps --filter "name=server-sql-server-1" --format "table {{.Names}}" | Select-String "server-sql-server-1"

if (-not $sqlContainer) {
    Write-Host "❌ SQL Server container is not running. Please start the services first." -ForegroundColor Red
    exit 1
}

# Create backup directory inside container with proper permissions
Write-Host "🔧 Setting up backup directory permissions..." -ForegroundColor Yellow
docker exec server-sql-server-1 bash -c "mkdir -p /var/opt/mssql/backup && chown mssql:mssql /var/opt/mssql/backup && chmod 755 /var/opt/mssql/backup"

# Create the backup
Write-Host "💾 Creating database backup..." -ForegroundColor Yellow
$backupResult = docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P P@ssw0rd -Q "BACKUP DATABASE [TherapistDiaryDb] TO DISK = '/var/opt/mssql/backup/$BackupFileName' WITH FORMAT, INIT, COMPRESSION" -C

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database backup created successfully!" -ForegroundColor Green
    Write-Host "📁 Backup file is available at: .\backups\$BackupFileName" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database backup" -ForegroundColor Red
    Write-Host $backupResult -ForegroundColor Red
    exit 1
}
