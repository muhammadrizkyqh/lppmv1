# PowerShell script to fix Next.js 15 params issue
# Run this in the project root directory

Write-Host "🔧 Fixing Next.js 15 params in all route handlers..." -ForegroundColor Cyan

# Get all route.ts files with [id] or other dynamic segments
$files = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

$count = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix pattern 1: { params }: { params: { id: string } }
    # Replace with: { params }: { params: Promise<{ id: string }> } and await params
    
    # Pattern for single id parameter
    if ($content -match '\{ params \}: \{ params: \{ id: string \} \}') {
        $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
        
        # Add await for params.id usage
        $content = $content -replace '(where: \{ id: )params\.id', '$1(await params).id'
        $content = $content -replace '(params\.id)(?! })', '(await params).id'
        
        # Simple destructure pattern
        if ($content -notmatch 'const \{ id \} = await params') {
            $content = $content -replace '(const session = await requireAuth\(\)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n)', "`$1`n    const { id } = await params"
        }
    }
    
    # Pattern for memberId parameter  
    if ($content -match '\{ params \}: \{ params: \{ id: string; memberId: string \} \}') {
        $content = $content -replace '\{ params \}: \{ params: \{ id: string; memberId: string \} \}', '{ params }: { params: Promise<{ id: string; memberId: string }> }'
    }
    
    # If content changed, write it back
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`n🎉 Fixed $count files!" -ForegroundColor Green
Write-Host "⚠️  Please manually review the changes and fix any remaining params.id references" -ForegroundColor Yellow
