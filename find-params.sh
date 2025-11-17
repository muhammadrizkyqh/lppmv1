#!/bin/bash
# Script to find all route files that need fixing
echo "📋 Finding all route.ts files with params..."
find app/api -name "route.ts" -type f | while read file; do
    if grep -q "{ params }: { params:" "$file"; then
        echo "❌ Needs fix: $file"
    fi
done
