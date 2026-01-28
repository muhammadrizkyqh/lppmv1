# PowerShell Script untuk Pre-Flight Check Lokal
# Jalankan di PowerShell: .\scripts\local-preflight-check.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "LOCAL PRE-MIGRATION CHECKLIST" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0

# 1. Check next.config.ts
Write-Host "1. Next.js Configuration:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path "next.config.ts") {
    $config = Get-Content "next.config.ts" -Raw
    
    if ($config -match "output:\s*['""]standalone['""]") {
        Write-Host "   Output mode: standalone" -ForegroundColor Green
    } else {
        Write-Host "   Output mode: NOT standalone!" -ForegroundColor Red
        $issues++
    }
    
    if ($config -match "outputFileTracingIncludes") {
        Write-Host "   Prisma tracing: CONFIGURED" -ForegroundColor Green
    } else {
        Write-Host "   Prisma tracing: MISSING" -ForegroundColor Yellow
        Write-Host "   (May cause issues with Prisma in standalone)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: next.config.ts not found!" -ForegroundColor Red
    $issues++
}
Write-Host ""

# 2. Check package.json scripts
Write-Host "2. Package.json Scripts:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    
    if ($pkg.scripts.PSObject.Properties['deploy:prepare']) {
        Write-Host "   deploy:prepare script: EXISTS" -ForegroundColor Green
    } else {
        Write-Host "   deploy:prepare script: MISSING!" -ForegroundColor Red
        $issues++
    }
    
    if ($pkg.scripts.PSObject.Properties['start:standalone']) {
        Write-Host "   start:standalone script: EXISTS" -ForegroundColor Green
    } else {
        Write-Host "   start:standalone script: MISSING" -ForegroundColor Yellow
    }
    
    Write-Host "   Next.js version: $($pkg.dependencies.next)" -ForegroundColor Cyan
} else {
    Write-Host "   ERROR: package.json not found!" -ForegroundColor Red
    $issues++
}
Write-Host ""

# 3. Check deploy-prepare script
Write-Host "3. Deployment Scripts:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path "scripts/deploy-prepare.js") {
    Write-Host "   deploy-prepare.js: EXISTS" -ForegroundColor Green
} else {
    Write-Host "   deploy-prepare.js: MISSING!" -ForegroundColor Red
    $issues++
}

if (Test-Path "scripts/vps-preflight-check.sh") {
    Write-Host "   vps-preflight-check.sh: EXISTS" -ForegroundColor Green
} else {
    Write-Host "   vps-preflight-check.sh: MISSING" -ForegroundColor Yellow
}
Write-Host ""

# 4. Check GitHub Actions workflow
Write-Host "4. GitHub Actions Workflow:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path ".github/workflows/deploy.yml") {
    $workflow = Get-Content ".github/workflows/deploy.yml" -Raw
    
    if ($workflow -match "deploy:prepare") {
        Write-Host "   Workflow uses deploy:prepare: YES" -ForegroundColor Green
    } else {
        Write-Host "   Workflow uses deploy:prepare: NO!" -ForegroundColor Red
        Write-Host "   (Workflow not updated for standalone!)" -ForegroundColor Red
        $issues++
    }
    
    if ($workflow -match "server\.js") {
        Write-Host "   PM2 starts server.js: YES" -ForegroundColor Green
    } else {
        Write-Host "   PM2 starts server.js: NO!" -ForegroundColor Red
        Write-Host "   (Still using npm start!)" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "   WARNING: No GitHub Actions workflow found" -ForegroundColor Yellow
    Write-Host "   (Manual deployment only)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Check ecosystem.config.js
Write-Host "5. PM2 Configuration:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path "ecosystem.config.js") {
    $ecosystem = Get-Content "ecosystem.config.js" -Raw
    
    if ($ecosystem -match "script:\s*['""]\.\/server\.js['""]") {
        Write-Host "   ecosystem.config.js: CONFIGURED for standalone" -ForegroundColor Green
    } else {
        Write-Host "   ecosystem.config.js: NOT configured for standalone!" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "   ecosystem.config.js: NOT FOUND" -ForegroundColor Yellow
    Write-Host "   (Will be created by workflow)" -ForegroundColor Yellow
}
Write-Host ""

# 6. Check Prisma setup
Write-Host "6. Prisma Configuration:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path "prisma/schema.prisma") {
    Write-Host "   schema.prisma: EXISTS" -ForegroundColor Green
    
    $migrations = Get-ChildItem "prisma/migrations" -ErrorAction SilentlyContinue
    if ($migrations) {
        Write-Host "   Migrations: $($migrations.Count) found" -ForegroundColor Green
    } else {
        Write-Host "   Migrations: None found" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: Prisma schema not found!" -ForegroundColor Red
    $issues++
}
Write-Host ""

# 7. Check .env files
Write-Host "7. Environment Files:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path ".env") {
    Write-Host "   .env (local): EXISTS" -ForegroundColor Green
} else {
    Write-Host "   .env (local): MISSING" -ForegroundColor Yellow
}

if (Test-Path ".env.production") {
    Write-Host "   .env.production: EXISTS" -ForegroundColor Green
} else {
    Write-Host "   .env.production: MISSING" -ForegroundColor Yellow
    Write-Host "   (Make sure VPS has this file!)" -ForegroundColor Yellow
}
Write-Host ""

# 8. Test build locally
Write-Host "8. Local Build Test:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path ".next") {
    Write-Host "   .next folder: EXISTS" -ForegroundColor Green
    
    $nextSize = (Get-ChildItem -Path ".next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   .next size: $([math]::Round($nextSize, 2)) MB" -ForegroundColor Cyan
    
    if (Test-Path ".next/standalone") {
        Write-Host "   .next/standalone: EXISTS" -ForegroundColor Green
        
        $standaloneSize = (Get-ChildItem -Path ".next/standalone" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   Standalone size: $([math]::Round($standaloneSize, 2)) MB" -ForegroundColor Cyan
        
        if (Test-Path ".next/standalone/server.js") {
            Write-Host "   server.js: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "   server.js: MISSING!" -ForegroundColor Red
            $issues++
        }
        
        if (Test-Path ".next/standalone/.next") {
            Write-Host "   .next/standalone/.next: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "   .next/standalone/.next: MISSING!" -ForegroundColor Red
            $issues++
        }
        
        if (Test-Path ".next/standalone/public") {
            Write-Host "   .next/standalone/public: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "   .next/standalone/public: MISSING" -ForegroundColor Yellow
            Write-Host "   (Run: npm run deploy:prepare)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   .next/standalone: NOT FOUND!" -ForegroundColor Red
        Write-Host "   (Run: npm run build)" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "   .next folder: NOT FOUND" -ForegroundColor Yellow
    Write-Host "   (Run: npm run build first)" -ForegroundColor Yellow
}
Write-Host ""

# 9. Check Git status
Write-Host "9. Git Repository:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
if (Test-Path ".git") {
    $gitStatus = git status --porcelain 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        if ($gitStatus) {
            Write-Host "   Uncommitted changes: YES" -ForegroundColor Yellow
            $changedFiles = ($gitStatus | Measure-Object).Count
            Write-Host "   Files changed: $changedFiles" -ForegroundColor Yellow
        } else {
            Write-Host "   Working tree: CLEAN" -ForegroundColor Green
        }
        
        $branch = git branch --show-current
        Write-Host "   Current branch: $branch" -ForegroundColor Cyan
        
        if ($branch -eq "master" -or $branch -eq "main") {
            Write-Host "   Ready to trigger workflow: YES" -ForegroundColor Green
        } else {
            Write-Host "   Ready to trigger workflow: NO (not on master/main)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Git not initialized or not in git repo" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Not a Git repository" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MIGRATION READINESS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($issues -eq 0) {
    Write-Host "All checks passed! Safe to commit and push." -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Run VPS preflight check (see below)" -ForegroundColor White
    Write-Host "2. Commit changes: git add . && git commit -m 'feat: migrate to standalone'" -ForegroundColor White
    Write-Host "3. Push to trigger deployment: git push origin master" -ForegroundColor White
    Write-Host "4. Monitor GitHub Actions workflow" -ForegroundColor White
    Write-Host "5. Verify deployment on VPS" -ForegroundColor White
} else {
    Write-Host "Found $issues issue(s)! Fix before proceeding." -ForegroundColor Red
    Write-Host ""
    Write-Host "REQUIRED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Review issues listed above" -ForegroundColor White
    Write-Host "2. Fix all RED items" -ForegroundColor White
    Write-Host "3. Run 'npm run build' if needed" -ForegroundColor White
    Write-Host "4. Run 'npm run deploy:prepare' if needed" -ForegroundColor White
    Write-Host "5. Re-run this check" -ForegroundColor White
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VPS CHECK COMMAND:" -ForegroundColor Cyan
Write-Host "ssh deploy@your-vps-ip 'bash -s' < scripts/vps-preflight-check.sh" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated: $(Get-Date)" -ForegroundColor Gray
