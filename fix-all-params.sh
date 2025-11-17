#!/bin/bash
# Auto-fix Next.js 15 params in all route handlers
# Run: chmod +x fix-all-params.sh && ./fix-all-params.sh

echo "🔧 Fixing Next.js 15 params in all API routes..."

# Find all route.ts files and fix them
find app/api -name "route.ts" -type f | while read file; do
    # Create backup
    cp "$file" "$file.bak"
    
    # Fix: { params }: { params: { id: string } } -> { params }: { params: Promise<{ id: string }> }
    sed -i 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Fix: { params }: { params: { id: string; memberId: string } } -> Promise version
    sed -i 's/{ params }: { params: { id: string; memberId: string } }/{ params }: { params: Promise<{ id: string; memberId: string }> }/g' "$file"
    
    echo "✅ Fixed: $file"
done

echo ""
echo "⚠️  IMPORTANT: You need to manually add 'const { id } = await params' after requireAuth() in each file!"
echo "⚠️  Pattern:"
echo "   const session = await requireAuth()"
echo "   ..."
echo "   const { id } = await params  // <-- ADD THIS LINE"
echo ""
echo "📝 Backup files created with .bak extension"
echo "🎉 Type signature fixes completed!"
