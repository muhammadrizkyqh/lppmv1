#!/usr/bin/env node

/**
 * 🧹 Cleanup Local Build Files
 * 
 * This script removes local build artifacts that shouldn't be in the repository:
 * - .next/ folder (build output)
 * - tsconfig.tsbuildinfo (TypeScript build info)
 * - node_modules/.cache/ (build cache)
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    try {
      const stats = fs.statSync(currentPath);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
      }
    } catch (err) {
      // Ignore errors (permission denied, etc)
    }
  }
  
  try {
    calculateSize(dirPath);
  } catch (err) {
    // Ignore errors
  }
  
  return totalSize;
}

function cleanupLocal() {
  log('\n🧹 Cleaning up local build files...', 'bright');
  log('='.repeat(60), 'blue');

  const rootDir = process.cwd();
  let totalFreed = 0;
  let filesRemoved = 0;

  const itemsToClean = [
    { 
      path: path.join(rootDir, '.next'),
      name: '.next/',
      description: 'Next.js build output'
    },
    { 
      path: path.join(rootDir, 'tsconfig.tsbuildinfo'),
      name: 'tsconfig.tsbuildinfo',
      description: 'TypeScript build info'
    },
    { 
      path: path.join(rootDir, 'node_modules', '.cache'),
      name: 'node_modules/.cache/',
      description: 'Build cache'
    }
  ];

  itemsToClean.forEach(item => {
    if (fs.existsSync(item.path)) {
      const size = getDirectorySize(item.path);
      
      log(`\n🗑️  Removing ${item.name}`, 'yellow');
      log(`   Description: ${item.description}`, 'blue');
      log(`   Size: ${formatBytes(size)}`, 'blue');
      
      try {
        const stats = fs.statSync(item.path);
        if (stats.isDirectory()) {
          fs.rmSync(item.path, { recursive: true, force: true });
        } else {
          fs.unlinkSync(item.path);
        }
        
        totalFreed += size;
        filesRemoved++;
        log(`   ✅ Removed successfully`, 'green');
      } catch (err) {
        log(`   ❌ Failed to remove: ${err.message}`, 'red');
      }
    } else {
      log(`\n⏭️  ${item.name} - not found (already clean)`, 'blue');
    }
  });

  log('\n' + '='.repeat(60), 'blue');
  log('✨ CLEANUP COMPLETE', 'bright');
  log('='.repeat(60), 'blue');
  log(`📊 Items removed: ${filesRemoved}`, 'green');
  log(`💾 Space freed: ${formatBytes(totalFreed)}`, 'green');
  log('='.repeat(60), 'blue');
  log('');
  
  if (filesRemoved > 0) {
    log('💡 Tip: These files will be regenerated when you run "npm run build"', 'yellow');
    log('');
  }
}

// Run the script
try {
  cleanupLocal();
} catch (err) {
  log('\n❌ ERROR: Cleanup failed!', 'red');
  log(err.message, 'red');
  console.error(err);
  process.exit(1);
}
