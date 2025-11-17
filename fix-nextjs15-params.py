#!/usr/bin/env python3
"""
Auto-fix Next.js 15 params Promise issue in all route handlers
Usage: python3 fix-nextjs15-params.py
"""

import os
import re
from pathlib import Path

def fix_route_file(filepath):
    """Fix a single route.ts file for Next.js 15 params"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix 1: Change type signature from { params: { id: string } } to Promise<{}>
    content = re.sub(
        r'\{ params \}: \{ params: \{ id: string \} \}',
        '{ params }: { params: Promise<{ id: string }> }',
        content
    )
    
    # Fix 2: Change memberId signature
    content = re.sub(
        r'\{ params \}: \{ params: \{ id: string; memberId: string \} \}',
        '{ params }: { params: Promise<{ id: string; memberId: string }> }',
        content
    )
    
    # Fix 3: Add destructuring after requireAuth (only if Promise<{ id: string }> exists and no await params yet)
    if 'Promise<{ id: string }>' in content and 'const { id } = await params' not in content:
        # Find pattern: after requireAuth check, before first prisma call
        pattern = r'(\s+)(if \(session\.role[^\}]+\}\s+\})'
        
        def add_await_params(match):
            return match.group(0) + '\n\n    const { id } = await params'
        
        content = re.sub(pattern, add_await_params, content, count=1)
    
    # Fix 4: Replace params.id with id (after we added destructuring)
    if 'const { id } = await params' in content:
        content = re.sub(r'params\.id', 'id', content)
    else:
        # If no destructuring, use (await params).id
        content = re.sub(r'params\.id', '(await params).id', content)
    
    # Fix 5: Replace params.memberId similarly
    if 'const { id, memberId } = await params' in content:
        content = re.sub(r'params\.memberId', 'memberId', content)
    elif 'memberId' in content:
        content = re.sub(r'params\.memberId', '(await params).memberId', content)
    
    # Only write if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Find and fix all route.ts files"""
    root = Path('app/api')
    count = 0
    
    print("🔧 Fixing Next.js 15 params in all route handlers...\n")
    
    for filepath in root.rglob('route.ts'):
        if fix_route_file(filepath):
            print(f"✅ Fixed: {filepath}")
            count += 1
        else:
            print(f"⏭️  Skipped: {filepath} (no changes needed)")
    
    print(f"\n🎉 Fixed {count} files!")
    print("\n⚠️  IMPORTANT: Manually review all files and fix any remaining issues:")
    print("   1. Check destructuring is in the right place")
    print("   2. Verify await params is used correctly")
    print("   3. Test build with: npm run build")

if __name__ == '__main__':
    main()
