# PowerShell Script to Fix Next.js 15 Params Issue
# Run: .\fix-all-routes.ps1

$files = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts" | Where-Object {
    (Get-Content $_.FullName -Raw) -match '\{ params \}: \{ params:'
}

Write-Host "🔧 Found $($files.Count) files to fix..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    $content = Get-Content -Path $file.FullName -Raw
    $changed = $false
    
    # Fix 1: Single id parameter
    if ($content -match '\{ params \}: \{ params: \{ id: string \} \}') {
        $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
        $changed = $true
        
        # Add await destructuring if not exists
        if ($content -notmatch 'const \{ id \} = await params') {
            # Pattern 1: After requireAuth check
            if ($content -match '(\s+)(if \(session\.role[^\}]+\}[^\}]*\}\s*\n)') {
                $content = $content -replace '(\s+)(if \(session\.role[^\}]+\}[^\}]*\}\s*\n)', "`$1`$2`n    const { id } = await params`n"
            }
            # Pattern 2: After requireRole
            elseif ($content -match '(await requireRole\([^\)]+\)\s*\n)') {
                $content = $content -replace '(await requireRole\([^\)]+\)\s*\n)', "`$1`n    const { id } = await params`n"
            }
            # Pattern 3: After requireAuth simple
            elseif ($content -match '(await requireAuth\(\)\s*\n)') {
                $content = $content -replace '(await requireAuth\(\)\s*\n)', "`$1`n    const { id } = await params`n"
            }
            # Pattern 4: After session check
            elseif ($content -match '(\}\s*\n\s*\n)(\s+const )') {
                $content = $content -replace '(\}\s*\n\s*\n)(\s+const )', "`$1    const { id } = await params`n`n`$2"
            }
        }
        
        # Replace params.id with id
        $content = $content -replace 'params\.id', 'id'
    }
    
    # Fix 2: Multiple params (id + memberId)
    if ($content -match '\{ params \}: \{ params: \{ id: string; memberId: string \} \}') {
        $content = $content -replace '\{ params \}: \{ params: \{ id: string; memberId: string \} \}', '{ params }: { params: Promise<{ id: string; memberId: string }> }'
        $changed = $true
        
        # Add await destructuring
        if ($content -notmatch 'const \\{ id, memberId \\} = await params') {
            $content = $content -replace '(await requireAuth\(\)\s*\n)', '$1

    const { id, memberId } = await params
'
        }
        
        # Replace params.id and params.memberId
        $content = $content -replace 'params\.id', 'id'
        $content = $content -replace 'params\.memberId', 'memberId'
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Skipped: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Done! Now run: npm run build" -ForegroundColor Green
