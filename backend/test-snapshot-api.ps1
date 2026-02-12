# Test snapshot generation API using PowerShell
Write-Host "🧪 Testing Snapshot Generation API..." -ForegroundColor Green

$testData = @{
    snapshot_name = "Test_Hierarchical_Export"
    snapshot_year = 2026
    file_type = "excel"
    selectedFormat = "1"
    description = "Test hierarchical archive export"
    filters = @{}
    is_official = $false
} | ConvertTo-Json

Write-Host "📤 Sending request..." -ForegroundColor Yellow
Write-Host $testData

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/laporan/snapshots/generate" -Method POST -ContentType "application/json" -Body $testData
    
    if ($response.success) {
        Write-Host "✅ Snapshot generated successfully!" -ForegroundColor Green
        Write-Host "📊 Result:"
        $response | ConvertTo-Json -Depth 3
        
        if ($response.data.id) {
            Write-Host "📥 File available for download via: http://localhost:5000/api/laporan/snapshots/$($response.data.id)/download" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Snapshot generation failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "🚨 Error testing snapshot API: $($_.Exception.Message)" -ForegroundColor Red
}