# Clean unwanted test and migration files
Write-Host "Cleaning unwanted test and migration files..." -ForegroundColor Cyan

# Define patterns to delete
$patterns = @(
    "test-*.json",
    "*-test.json",
    "*-migration.ps1",
    "run-migration*.ps1",
    "*-migration.sql"
)

# Loop through each pattern and delete matching files
foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File
    
    if ($files.Count -eq 0) {
        Write-Host "No files found matching pattern: $pattern" -ForegroundColor Gray
    } else {
        Write-Host "Found $($files.Count) files matching pattern: $pattern" -ForegroundColor Cyan
        foreach ($file in $files) {
            Write-Host "Removing $($file.FullName)" -ForegroundColor Yellow
            Remove-Item -Path $file.FullName -Force
        }
    }
}

Write-Host "Cleaning complete!" -ForegroundColor Green
