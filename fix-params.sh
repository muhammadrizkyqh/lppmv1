#!/bin/bash
# Fix Next.js 15 async params in all API routes

cd ~/lppmv1

echo "Fixing async params in API routes..."

# Find all route files in dynamic folders
find app/api -type f -name "route.ts" -path "*\[*\]*" | while read file; do
  echo "Checking $file"
  
  # Check if file has old params pattern
  if grep -q '{ params }: { params:' "$file"; then
    echo "  → Fixing $file"
    
    # Backup
    cp "$file" "$file.bak"
    
    # Replace pattern: { params }: { params: { id: string } } → { params }: Promise<{ id: string }>
    sed -i 's/{ params }: { params: \(.*\) }/{ params }: Promise<\1>/g' "$file"
    
    # Add await for params
    sed -i '/const.*= await params/!s/params\.\([a-zA-Z]*\)/\(await params\)\.\1/g' "$file"
  fi
done

echo "Done!"
echo ""
echo "Run: npm run build"
