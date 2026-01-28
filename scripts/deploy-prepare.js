const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing Next.js Standalone Deployment');
console.log('==========================================\n');

const standaloneDir = path.join(process.cwd(), '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.error('❌ Error: .next/standalone directory not found!');
  console.error('   Please run "npm run build" first.');
  process.exit(1);
}

console.log('📦 Preparing standalone package...\n');

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠️  ${src} not found, skipping...`);
    return false;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  return true;
}

// Copy public folder
console.log('  ↳ Copying public files...');
if (copyDir(
  path.join(process.cwd(), 'public'),
  path.join(standaloneDir, 'public')
)) {
  console.log('     ✓ Public files copied');
}

// Copy .next/static
console.log('  ↳ Copying .next/static...');
if (copyDir(
  path.join(process.cwd(), '.next', 'static'),
  path.join(standaloneDir, '.next', 'static')
)) {
  console.log('     ✓ Static files copied');
}

// Copy Prisma schema
console.log('  ↳ Copying Prisma files...');
if (copyDir(
  path.join(process.cwd(), 'prisma'),
  path.join(standaloneDir, 'prisma')
)) {
  console.log('     ✓ Prisma files copied');
}

// Copy environment file
console.log('  ↳ Copying environment file...');
const envFiles = ['.env.production', '.env'];
let envCopied = false;
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(
      envPath,
      path.join(standaloneDir, '.env')
    );
    console.log(`     ✓ ${envFile} copied as .env`);
    envCopied = true;
    break;
  }
}
if (!envCopied) {
  console.log('     ⚠️  No .env file found');
}

// Create uploads directory
console.log('  ↳ Creating uploads directory...');
const uploadsDir = path.join(standaloneDir, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
console.log('     ✓ Uploads directory created');

// Calculate size
function getDirectorySize(dirPath) {
  let size = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      try {
        const stats = fs.statSync(filePath);
        size += stats.size;
      } catch (e) {
        // Skip files we can't access
      }
    }
  }
  
  return size;
}

const sizeBytes = getDirectorySize(standaloneDir);
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

console.log('\n📊 Size Analysis:');
console.log(`  Standalone build size: ${sizeMB} MB`);
console.log('  (Compare with baseline: ~1,609 MB)');

const reduction = ((1609 - parseFloat(sizeMB)) / 1609 * 100).toFixed(1);
console.log(`  Reduction: ${reduction}% 🎉`);

console.log('\n✅ Standalone build ready!');
console.log('📍 Location: .next/standalone/\n');
console.log('🎯 To test locally:');
console.log('   cd .next\\standalone');
console.log('   node server.js\n');
console.log('🚀 To deploy:');
console.log('   Upload .next/standalone/ folder to your server');
console.log('   Run: node server.js');
