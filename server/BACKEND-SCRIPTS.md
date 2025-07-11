# Backend Management Scripts Documentation

This document describes the PowerShell scripts for managing the TherapistDiary backend services with automatic database backup and restore functionality.

## Overview

The backend consists of two main services running in Docker containers:
- **SQL Server** - Database server (port 1433)
- **TherapistDiary API** - .NET Web API (ports 5000/5001)

Two PowerShell scripts provide automated management:
- `backend-stop.ps1` - Gracefully stops services with automatic database backup
- `backend-start.ps1` - Starts services with optional database restore

## Prerequisites

- Docker Desktop installed and running
- PowerShell 5.1 or later
- Docker Compose files configured in the server directory

## Scripts Location

Both scripts are located in the `server` directory:
```
server/
├── backend-start.ps1
├── backend-stop.ps1
├── backups/           # Created automatically
├── docker-compose.yml
└── ...
```

## backend-stop.ps1

### Purpose
Gracefully stops all backend services and creates an automatic database backup.

### Features
- ✅ Automatic timestamped database backup
- ✅ Copies backup from container to host
- ✅ Graceful container shutdown
- ✅ Docker cleanup (removes unused volumes)
- ✅ Error handling with colored output

### Usage

**Basic usage:**
```powershell
.\backend-stop.ps1
```

**With custom backup name:**
```powershell
.\backend-stop.ps1 -BackupName "my-custom-backup"
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `BackupName` | String | `therapist-diary-backup-{timestamp}` | Custom name for the backup file |

### Process Flow

1. **Check Running Containers** - Verifies which backend containers are running
2. **Create Database Backup** - Uses SQL Server tools to create a `.bak` file
3. **Copy Backup to Host** - Transfers backup from container to `server/backups/`
4. **Stop Services** - Runs `docker compose down`
5. **Cleanup** - Removes unused Docker volumes and resources

### Output Example

```
🛑 Stopping backend services and creating database backup...
📋 Found running containers: server-sql-server-1, server-therapist-diary-api-1
📁 Created backups directory: D:\...\server\backups
💾 Creating database backup...
✅ Database backup created successfully: D:\...\server\backups\therapist-diary-backup-20250711-143022.bak
🛑 Stopping Docker Compose services...
✅ Backend services stopped successfully
🧹 Cleaning up unused Docker resources...
🎉 Backend shutdown completed!
```

## backend-start.ps1

### Purpose
Starts all backend services with optional database restoration from previous backups.

### Features
- ✅ **Fresh API deployment** - Rebuilds API container on every start
- ✅ Automated service startup with health checks
- ✅ Multiple restore options (interactive, latest, specific file)
- ✅ SQL Server health monitoring
- ✅ API availability testing
- ✅ Comprehensive error handling

### Usage

**Start without restore:**
```powershell
.\backend-start.ps1 -SkipRestore
```

**Start with interactive backup selection:**
```powershell
.\backend-start.ps1
```

**Start with latest backup:**
```powershell
.\backend-start.ps1 -RestoreLatest
```

**Start with specific backup file:**
```powershell
.\backend-start.ps1 -BackupFile "C:\path\to\backup.bak"
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `BackupFile` | String | `$null` | Path to specific backup file to restore |
| `RestoreLatest` | Switch | `$false` | Automatically restore the most recent backup |
| `SkipRestore` | Switch | `$false` | Skip database restoration entirely |

### Process Flow

1. **Build and Start Services** - Runs `docker compose up -d --build therapist-diary-api` (fresh API build)
2. **Wait for SQL Server** - Monitors health status (up to 30 attempts)
3. **Database Restoration** (if not skipped):
   - **Interactive Mode** - Shows available backups for selection
   - **Latest Mode** - Automatically selects newest backup
   - **Specific File** - Uses provided backup file path
4. **Restore Process**:
   - Copy backup file to container
   - Drop existing database (if exists)
   - Restore from backup file
   - Clean up temporary files
5. **API Health Check** - Tests API endpoint availability
6. **Status Report** - Shows running containers and URLs

### Interactive Backup Selection

When run without parameters, the script shows available backups:

```
📁 Available backup files:
  [0] therapist-diary-backup-20250711-143022.bak - 1/11/2025 2:30:22 PM
  [1] therapist-diary-backup-20250711-120000.bak - 1/11/2025 12:00:00 PM
  [2] therapist-diary-backup-20250710-180000.bak - 1/10/2025 6:00:00 PM
  [s] Skip restore
Select backup to restore (0-2 or 's' to skip): 
```

### Output Example

```
🚀 Starting backend services...
� Building and starting Docker Compose services...
📦 Rebuilding therapist-diary-api for fresh deployment...
⏳ Waiting for SQL Server to be ready...
Attempt 5/30 - SQL Server status: healthy
✅ SQL Server is ready!
📁 Using latest backup file: therapist-diary-backup-20250711-143022.bak
💾 Restoring database from backup...
✅ Database restored successfully!
⏳ Waiting for API to be ready...
✅ API container is running
✅ API is responding successfully!
🎉 Backend startup completed!
📍 API URL: https://localhost:5000
📍 SQL Server: localhost:1433

📋 Running containers:
NAMES                          STATUS          PORTS
server-sql-server-1           Up 2 minutes    0.0.0.0:1433->1433/tcp
server-therapist-diary-api-1  Up 2 minutes    0.0.0.0:5000->5000/tcp, 0.0.0.0:5001->5001/tcp
```

## Backup Management

### Backup Location
All backups are stored in: `server/backups/`

### Backup Naming Convention
- **Automatic**: `therapist-diary-backup-YYYYMMDD-HHMMSS.bak`
- **Custom**: `{CustomName}.bak`

### Backup File Management
- Backups accumulate over time - manual cleanup recommended
- Each backup is a full database backup
- Backup files can be used with any SQL Server instance

## Troubleshooting

### Common Issues

**1. Docker services fail to start**
```powershell
❌ Failed to start Docker services
```
- **Solution**: Ensure Docker Desktop is running and check `docker-compose.yml`

**2. SQL Server doesn't become healthy**
```powershell
❌ SQL Server failed to become healthy within timeout
```
- **Solution**: Check SQL Server logs with `docker logs server-sql-server-1`
- Increase timeout or check system resources

**3. Database backup fails**
```powershell
❌ Database backup failed
```
- **Solution**: Verify SQL Server is running and database exists
- Check SQL Server logs for specific errors

**4. Database restore fails**
```powershell
❌ Database restore failed
```
- **Solution**: Ensure backup file is valid and not corrupted
- Verify sufficient disk space in container

**5. API health check fails**
```powershell
⚠️ API health check failed, but container is running
```
- **Solution**: API might still be starting up - this is often normal
- Check API logs with `docker logs server-therapist-diary-api-1`

### Debug Commands

**Check container status:**
```powershell
docker ps
```

**View logs:**
```powershell
docker logs server-sql-server-1
docker logs server-therapist-diary-api-1
```

**Check Docker Compose services:**
```powershell
docker compose ps
```

**Manual backup creation:**
```powershell
docker exec server-sql-server-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "P@ssw0rd" -Q "BACKUP DATABASE [TherapistDiaryDb] TO DISK = '/var/opt/mssql/backup/manual-backup.bak'" -C
```

## Best Practices

### Development Workflow
1. Use `.\backend-stop.ps1` to stop services (creates automatic backup)
2. Make code changes
3. Use `.\backend-start.ps1 -RestoreLatest` to start with previous data

### Production Deployment
1. Use `.\backend-stop.ps1` before deployment
2. Deploy new code
3. Use `.\backend-start.ps1 -RestoreLatest` to maintain data continuity

### Backup Strategy
- Regular backups are created automatically on each stop
- Keep important backups in a separate location
- Test restore procedures periodically
- Clean up old backup files to save disk space

## Configuration

### Environment Variables
The scripts work with the Docker Compose configuration. Key environment variables:

```yaml
# docker-compose.yml
environment:
  - SA_PASSWORD=P@ssw0rd
  - DB_CONNECTION_STRING=Server=sql-server;Database=TherapistDiaryDb;...
```

### Ports
- **API HTTPS**: `https://localhost:5000`
- **API HTTP**: `http://localhost:5001`
- **SQL Server**: `localhost:1433`

### Health Checks
SQL Server health check is configured in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P P@ssw0rd -Q 'SELECT 1' -C"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 80s
```

## Security Notes

- Database password is stored in Docker Compose file
- Backup files contain sensitive data - protect accordingly
- HTTPS certificates are mounted from host system
- Consider using Docker secrets for production environments

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-11 | Initial release with backup/restore functionality |

---

For issues or improvements, please check the project repository or contact the development team.
