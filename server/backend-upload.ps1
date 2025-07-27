# Backend Upload Script - Build and Push to Docker Hub
param(
    [string]$DockerHubUsername = "nikihattan",
    [string]$Tag = "latest",
    [string]$ImageName = "therapist-diary-be",
    [switch]$SkipBuild = $false,
    [switch]$SkipPush = $false
)

# Colors for output
$ColorGreen = "Green"
$ColorCyan = "Cyan"
$ColorYellow = "Yellow"
$ColorRed = "Red"
$ColorGray = "Gray"

Write-Host "🚀 Backend Upload Script" -ForegroundColor $ColorGreen
Write-Host "========================" -ForegroundColor $ColorGreen

$fullImageName = "$DockerHubUsername/$ImageName"
$taggedImageName = "$fullImageName`:$Tag"

Write-Host "📋 Build Configuration:" -ForegroundColor $ColorCyan
Write-Host "  • Docker Hub Username: $DockerHubUsername" -ForegroundColor $ColorGray
Write-Host "  • Image Name: $ImageName" -ForegroundColor $ColorGray
Write-Host "  • Tag: $Tag" -ForegroundColor $ColorGray
Write-Host "  • Full Image: $taggedImageName" -ForegroundColor $ColorGray
Write-Host ""

# Check if Docker is running
Write-Host "🔍 Checking Docker status..." -ForegroundColor $ColorCyan
try {
    $dockerVersion = docker version --format "{{.Client.Version}}" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
    Write-Host "✅ Docker is running (version: $dockerVersion)" -ForegroundColor $ColorGreen
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor $ColorRed
    exit 1
}

# Build the Docker image
if (-not $SkipBuild) {
    Write-Host "🔨 Building Docker image..." -ForegroundColor $ColorCyan
    Write-Host "Building: $taggedImageName" -ForegroundColor $ColorGray
    
    # Build using the Dockerfile context
    $buildCommand = "docker build -f src/Presentation/TherapistDiary.WebAPI/Dockerfile -t $taggedImageName ."
    Write-Host "Command: $buildCommand" -ForegroundColor $ColorGray
    
    try {
        Invoke-Expression $buildCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker build failed" -ForegroundColor $ColorRed
            exit 1
        }
        
        Write-Host "✅ Docker image built successfully!" -ForegroundColor $ColorGreen
    }
    catch {
        Write-Host "❌ Error during Docker build: $($_.Exception.Message)" -ForegroundColor $ColorRed
        exit 1
    }
} else {
    Write-Host "⏭️ Skipping build (SkipBuild flag set)" -ForegroundColor $ColorYellow
}

# Check if user is logged in to Docker Hub
Write-Host "🔐 Checking Docker Hub authentication..." -ForegroundColor $ColorCyan
try {
    $dockerInfo = docker info 2>$null | Select-String "Username:"
    if ($dockerInfo) {
        $currentUser = ($dockerInfo -split ":")[1].Trim()
        Write-Host "✅ Logged in as: $currentUser" -ForegroundColor $ColorGreen
        
        if ($currentUser -ne $DockerHubUsername) {
            Write-Host "⚠️ Warning: Logged in as '$currentUser' but trying to push to '$DockerHubUsername'" -ForegroundColor $ColorYellow
            $continue = Read-Host "Continue anyway? (y/N)"
            if ($continue -notmatch '^[Yy]') {
                Write-Host "❌ Operation cancelled" -ForegroundColor $ColorRed
                exit 1
            }
        }
    } else {
        Write-Host "⚠️ Not logged in to Docker Hub" -ForegroundColor $ColorYellow
        Write-Host "🔑 Please log in to Docker Hub:" -ForegroundColor $ColorCyan
        docker login
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker Hub login failed" -ForegroundColor $ColorRed
            exit 1
        }
        
        Write-Host "✅ Successfully logged in to Docker Hub" -ForegroundColor $ColorGreen
    }
}
catch {
    Write-Host "⚠️ Could not verify Docker Hub authentication" -ForegroundColor $ColorYellow
}

# Push the image to Docker Hub
if (-not $SkipPush) {
    Write-Host "📤 Pushing image to Docker Hub..." -ForegroundColor $ColorCyan
    Write-Host "Pushing: $taggedImageName" -ForegroundColor $ColorGray
    
    try {
        docker push $taggedImageName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker push failed" -ForegroundColor $ColorRed
            exit 1
        }
        
        Write-Host "✅ Image pushed successfully to Docker Hub!" -ForegroundColor $ColorGreen
    }
    catch {
        Write-Host "❌ Error during Docker push: $($_.Exception.Message)" -ForegroundColor $ColorRed
        exit 1
    }
} else {
    Write-Host "⏭️ Skipping push (SkipPush flag set)" -ForegroundColor $ColorYellow
}

# Also tag and push as 'latest' if not already latest
if ($Tag -ne "latest") {
    $latestImageName = "$fullImageName`:latest"
    Write-Host "🏷️ Tagging as latest: $latestImageName" -ForegroundColor $ColorCyan
    
    try {
        docker tag $taggedImageName $latestImageName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to tag as latest" -ForegroundColor $ColorRed
        } else {
            Write-Host "✅ Tagged as latest" -ForegroundColor $ColorGreen
            
            if (-not $SkipPush) {
                Write-Host "📤 Pushing latest tag..." -ForegroundColor $ColorCyan
                docker push $latestImageName
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "❌ Failed to push latest tag" -ForegroundColor $ColorRed
                } else {
                    Write-Host "✅ Latest tag pushed successfully!" -ForegroundColor $ColorGreen
                }
            }
        }
    }
    catch {
        Write-Host "⚠️ Error tagging as latest: $($_.Exception.Message)" -ForegroundColor $ColorYellow
    }
}

# Display final information
Write-Host ""
Write-Host "🎉 Upload completed!" -ForegroundColor $ColorGreen
Write-Host "📍 Docker Hub Repository: https://hub.docker.com/r/$fullImageName" -ForegroundColor $ColorCyan
Write-Host "📋 Available Tags:" -ForegroundColor $ColorCyan
Write-Host "  • $taggedImageName" -ForegroundColor $ColorGray
if ($Tag -ne "latest") {
    Write-Host "  • $fullImageName`:latest" -ForegroundColor $ColorGray
}

Write-Host ""
Write-Host "📖 Usage Instructions:" -ForegroundColor $ColorCyan
Write-Host "To pull and run this image:" -ForegroundColor $ColorGray
Write-Host "  docker pull $taggedImageName" -ForegroundColor $ColorGray
Write-Host "  docker run -p 5000:5000 -p 5001:5001 $taggedImageName" -ForegroundColor $ColorGray

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor $ColorCyan
Write-Host "  • Use -Tag parameter to specify version (e.g., -Tag 'v1.0.0')" -ForegroundColor $ColorGray
Write-Host "  • Use -SkipBuild to only push existing local image" -ForegroundColor $ColorGray
Write-Host "  • Use -SkipPush to only build without pushing" -ForegroundColor $ColorGray
