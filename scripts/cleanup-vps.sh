#!/bin/bash

###############################################################################
# 🧹 VPS Cleanup Script
# 
# This script cleans up your VPS by:
# 1. Removing old project folders (except lppmv1)
# 2. Cleaning up old PM2 processes
# 3. Removing old backup files (keeping last 3)
# 4. Cleaning package manager caches
# 5. Removing old log files
# 6. Freeing up disk space
#
# Usage:
#   1. Make executable: chmod +x scripts/cleanup-vps.sh
#   2. Run on VPS: bash cleanup-vps.sh
#   3. Or run remotely: ssh user@vps 'bash -s' < scripts/cleanup-vps.sh
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "\n${BOLD}${BLUE}$1${NC}"
    echo "============================================================"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as correct user
if [ "$USER" != "deploy" ]; then
    print_warning "This script should be run as 'deploy' user"
    print_info "Current user: $USER"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPONSE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_header "🧹 VPS Cleanup Script"
echo -e "${BOLD}Starting cleanup process...${NC}\n"

# Get initial disk usage
INITIAL_USAGE=$(df -h /home/deploy | awk 'NR==2 {print $3}')
print_info "Initial disk usage: $INITIAL_USAGE"

###############################################################################
# Step 1: List and remove old projects (except lppmv1)
###############################################################################
print_header "📁 Step 1: Cleaning old project folders"

cd /home/deploy || exit 1

# List all directories except lppmv1, uploads-persistent, and hidden folders
echo -e "\n${YELLOW}Current project folders:${NC}"
ls -d */ 2>/dev/null | grep -v '^lppmv1/' | grep -v '^uploads-persistent/' || echo "No other project folders found"

print_warning "This will remove ALL project folders except 'lppmv1' and 'uploads-persistent'"
read -p "Do you want to remove old project folders? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for dir in */; do
        if [[ "$dir" != "lppmv1/" ]] && [[ "$dir" != "uploads-persistent/" ]]; then
            print_info "Removing: $dir"
            rm -rf "$dir"
            print_success "Removed $dir"
        fi
    done
else
    print_info "Skipping project folder cleanup"
fi

###############################################################################
# Step 2: Clean PM2 processes
###############################################################################
print_header "🔧 Step 2: Cleaning PM2 processes"

# List all PM2 processes
pm2 list

print_warning "This will keep only 'lppm' process and remove others"
read -p "Clean old PM2 processes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get all PM2 app names except 'lppm'
    OLD_APPS=$(pm2 jlist | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | grep -v '^lppm$')
    
    if [ -z "$OLD_APPS" ]; then
        print_info "No old PM2 processes to remove"
    else
        for app in $OLD_APPS; do
            print_info "Deleting PM2 process: $app"
            pm2 delete "$app" 2>/dev/null
            print_success "Deleted $app"
        done
    fi
    
    # Flush old logs
    print_info "Flushing old PM2 logs..."
    pm2 flush
    print_success "PM2 logs flushed"
    
    # Save PM2 config
    pm2 save
else
    print_info "Skipping PM2 cleanup"
fi

###############################################################################
# Step 3: Clean old backups (keep last 3)
###############################################################################
print_header "📦 Step 3: Cleaning old backups"

cd /home/deploy || exit 1

BACKUP_COUNT=$(ls -1 lppmv1-backup-*.tar.gz 2>/dev/null | wc -l)
print_info "Found $BACKUP_COUNT backup file(s)"

if [ "$BACKUP_COUNT" -gt 3 ]; then
    print_info "Keeping last 3 backups, removing older ones..."
    ls -t lppmv1-backup-*.tar.gz | tail -n +4 | xargs rm -f
    NEW_COUNT=$(ls -1 lppmv1-backup-*.tar.gz 2>/dev/null | wc -l)
    print_success "Removed $((BACKUP_COUNT - NEW_COUNT)) old backup(s)"
    
    echo -e "\n${GREEN}Remaining backups:${NC}"
    ls -lh lppmv1-backup-*.tar.gz 2>/dev/null || echo "No backups"
else
    print_success "Backup count is within limit (≤3)"
fi

###############################################################################
# Step 4: Clean package manager caches
###############################################################################
print_header "📦 Step 4: Cleaning package manager caches"

# NPM cache
if command -v npm &> /dev/null; then
    print_info "Cleaning NPM cache..."
    CACHE_SIZE_BEFORE=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "0")
    npm cache clean --force 2>/dev/null
    CACHE_SIZE_AFTER=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "0")
    print_success "NPM cache cleaned (was: $CACHE_SIZE_BEFORE)"
fi

# Yarn cache (if exists)
if command -v yarn &> /dev/null; then
    print_info "Cleaning Yarn cache..."
    yarn cache clean 2>/dev/null
    print_success "Yarn cache cleaned"
fi

###############################################################################
# Step 5: Clean old logs
###############################################################################
print_header "📋 Step 5: Cleaning old log files"

# PM2 logs older than 7 days
if [ -d "$HOME/.pm2/logs" ]; then
    print_info "Removing PM2 log files older than 7 days..."
    find "$HOME/.pm2/logs" -type f -name "*.log" -mtime +7 -delete
    print_success "Old PM2 logs removed"
fi

# System journal (if accessible)
if command -v journalctl &> /dev/null; then
    print_info "Cleaning system journal (requires sudo)..."
    sudo journalctl --vacuum-time=7d 2>/dev/null || print_warning "Couldn't clean journal (no sudo access)"
fi

###############################################################################
# Step 6: Clean temporary files
###############################################################################
print_header "🗑️  Step 6: Cleaning temporary files"

# Remove deploy tar files
if [ -f "/home/deploy/deploy.tar.gz" ]; then
    print_info "Removing deployment package..."
    rm -f /home/deploy/deploy.tar.gz
    print_success "deploy.tar.gz removed"
fi

# Clean /tmp (only user's files)
print_info "Cleaning temporary files..."
find /tmp -user "$USER" -type f -mtime +1 -delete 2>/dev/null || print_warning "Couldn't clean /tmp"

###############################################################################
# Step 7: Summary
###############################################################################
print_header "📊 Cleanup Summary"

# Get final disk usage
FINAL_USAGE=$(df -h /home/deploy | awk 'NR==2 {print $3}')
print_success "Initial usage: $INITIAL_USAGE"
print_success "Final usage: $FINAL_USAGE"

echo -e "\n${BOLD}${GREEN}Current disk usage:${NC}"
df -h /home/deploy

echo -e "\n${BOLD}${GREEN}Largest directories in /home/deploy:${NC}"
du -sh /home/deploy/*/ 2>/dev/null | sort -hr | head -5

echo -e "\n${BOLD}${GREEN}PM2 processes:${NC}"
pm2 status

echo -e "\n${BOLD}${GREEN}✨ Cleanup complete!${NC}\n"

print_info "Recommended next steps:"
echo "  • Check if app is running: pm2 status lppm"
echo "  • View logs: pm2 logs lppm"
echo "  • Restart if needed: pm2 restart lppm"
