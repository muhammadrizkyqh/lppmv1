#!/usr/bin/env node

/**
 * 🚀 Deployment Preparation Script for Next.js Standalone Build
 * 
 * This script prepares the standalone build for deployment by:
 * 1. Copying the public folder to standalone
 * 2. Copying .next/static to standalone/.next/static
 * 3. Copying prisma schema and migrations
 * 4. Creating necessary symlinks structure info
 * 
 * This is CRITICAL for standalone builds to work properly!
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
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

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
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
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  try {
    calculateSize(dirPath);
  } catch (err) {
    // Ignore errors
  }
  
  return totalSize;
}

async function prepareDeployment() {
  log('\n🚀 Preparing Standalone Build for Deployment...', 'bright');
  log('=' .repeat(60), 'blue');

  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  const publicDir = path.join(rootDir, 'public');
  const staticDir = path.join(rootDir, '.next', 'static');
  const prismaDir = path.join(rootDir, 'prisma');

  // Step 1: Verify standalone folder exists
  log('\n📂 Step 1: Verifying standalone build...', 'yellow');
  
  if (!fs.existsSync(standaloneDir)) {
    log('❌ ERROR: Standalone folder not found!', 'red');
    log('   Please run "npm run build" first.', 'red');
    process.exit(1);
  }
  
  if (!fs.existsSync(path.join(standaloneDir, 'server.js'))) {
    log('❌ ERROR: server.js not found in standalone build!', 'red');
    log('   Make sure next.config.ts has: output: "standalone"', 'red');
    process.exit(1);
  }
  
  log('✅ Standalone folder verified', 'green');

  // Step 2: Copy public folder
  log('\n📁 Step 2: Copying public folder...', 'yellow');
  
  const standalonePublicDir = path.join(standaloneDir, 'public');
  
  if (fs.existsSync(publicDir)) {
    // Remove existing public in standalone (except uploads)
    if (fs.existsSync(standalonePublicDir)) {
      const entries = fs.readdirSync(standalonePublicDir);
      entries.forEach(entry => {
        if (entry !== 'uploads') {
          const entryPath = path.join(standalonePublicDir, entry);
          if (fs.statSync(entryPath).isDirectory()) {
            fs.rmSync(entryPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(entryPath);
          }
        }
      });
    }
    
    // Copy public folder (excluding uploads - will be symlinked in VPS)
    fs.readdirSync(publicDir).forEach(item => {
      if (item !== 'uploads') {
        const srcPath = path.join(publicDir, item);
        const destPath = path.join(standalonePublicDir, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
          copyRecursiveSync(srcPath, destPath);
        } else {
          if (!fs.existsSync(standalonePublicDir)) {
            fs.mkdirSync(standalonePublicDir, { recursive: true });
          }
          fs.copyFileSync(srcPath, destPath);
        }
      }
    });
    
    // Create empty uploads folder structure (will be symlinked in VPS)
    const uploadsDir = path.join(standalonePublicDir, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create README for uploads
    fs.writeFileSync(
      path.join(uploadsDir, 'README.md'),
      '# Uploads Directory\n\n' +
      'This directory will be symlinked to /home/deploy/uploads-persistent in production.\n' +
      'Files uploaded in production are stored in persistent storage and survive deployments.\n'
    );
    
    log('✅ Public folder copied (uploads folder ready for symlink)', 'green');
  } else {
    log('⚠️  Warning: Public folder not found', 'yellow');
  }

  // Step 3: Copy .next/static
  log('\n⚡ Step 3: Copying static assets...', 'yellow');
  
  const standaloneStaticDir = path.join(standaloneDir, '.next', 'static');
  
  if (fs.existsSync(staticDir)) {
    if (fs.existsSync(standaloneStaticDir)) {
      fs.rmSync(standaloneStaticDir, { recursive: true, force: true });
    }
    
    copyRecursiveSync(staticDir, standaloneStaticDir);
    log('✅ Static assets copied', 'green');
  } else {
    log('⚠️  Warning: Static folder not found', 'yellow');
  }

  // Step 4: Copy Prisma files
  log('\n🗄️  Step 4: Copying Prisma files...', 'yellow');
  
  const standalonePrismaDir = path.join(standaloneDir, 'prisma');
  
  if (fs.existsSync(prismaDir)) {
    if (fs.existsSync(standalonePrismaDir)) {
      fs.rmSync(standalonePrismaDir, { recursive: true, force: true });
    }
    
    copyRecursiveSync(prismaDir, standalonePrismaDir);
    log('✅ Prisma files copied', 'green');
  } else {
    log('⚠️  Warning: Prisma folder not found', 'yellow');
  }

  // Step 5: Create deployment info file
  log('\n📋 Step 5: Creating deployment info...', 'yellow');
  
  const deployInfo = {
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    standalone: true,
    uploadsSymlink: '/home/deploy/uploads-persistent',
    instructions: {
      uploads: 'The public/uploads folder should be symlinked to /home/deploy/uploads-persistent',
      start: 'Run: node server.js',
      env: 'Copy .env file before starting'
    }
  };
  
  fs.writeFileSync(
    path.join(standaloneDir, 'DEPLOY_INFO.json'),
    JSON.stringify(deployInfo, null, 2)
  );
  
  log('✅ Deployment info created', 'green');

  // Step 6: Calculate sizes
  log('\n📊 Step 6: Calculating deployment size...', 'yellow');
  
  const standaloneSize = getDirectorySize(standaloneDir);
  
  log('\n' + '='.repeat(60), 'blue');
  log('📦 DEPLOYMENT PACKAGE READY', 'bright');
  log('='.repeat(60), 'blue');
  log(`📏 Total Size: ${formatBytes(standaloneSize)}`, 'green');
  log(`📂 Location: .next/standalone/`, 'green');
  log(`🚀 Ready to deploy!`, 'green');
  log('\n📌 Important Notes:', 'yellow');
  log('   • The uploads folder will be symlinked in VPS', 'blue');
  log('   • No npm install needed on VPS', 'blue');
  log('   • All dependencies are bundled', 'blue');
  log('   • Just run: node server.js', 'blue');
  log('='.repeat(60), 'blue');
  log('');
}

// Run the script
prepareDeployment().catch(err => {
  log('\n❌ ERROR: Deployment preparation failed!', 'red');
  log(err.message, 'red');
  console.error(err);
  process.exit(1);
});
