#!/bin/bash
# Fresh VPS Setup for CI/CD
# Run as deploy user after VPS reinstall

set -e

echo "🚀 Fresh VPS Setup for GitHub Actions CI/CD"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variables
PROJECT_DIR="/home/deploy/lppmv1"
NODE_VERSION="24"

echo -e "${YELLOW}Step 1: Install Node.js${NC}"
echo "========================"

# Install NVM
if [ ! -d "$HOME/.nvm" ]; then
    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    echo -e "${GREEN}✓ NVM installed${NC}"
else
    echo -e "${GREEN}✓ NVM already installed${NC}"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node
echo "Installing Node.js ${NODE_VERSION}..."
nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}
nvm alias default ${NODE_VERSION}
echo -e "${GREEN}✓ Node.js installed: $(node -v)${NC}"

echo ""
echo -e "${YELLOW}Step 2: Install PM2${NC}"
echo "===================="

npm install -g pm2
echo -e "${GREEN}✓ PM2 installed: $(pm2 -v)${NC}"

echo ""
echo -e "${YELLOW}Step 3: Setup PM2 Startup${NC}"
echo "=========================="

PM2_STARTUP_CMD=$(pm2 startup | grep "sudo env PATH")
echo "Run this command manually with sudo:"
echo -e "${YELLOW}${PM2_STARTUP_CMD}${NC}"
echo ""
read -p "Press Enter after running the command above..."
echo -e "${GREEN}✓ PM2 startup configured${NC}"

echo ""
echo -e "${YELLOW}Step 4: Generate SSH Key for GitHub Actions${NC}"
echo "============================================="

SSH_KEY_PATH="$HOME/.ssh/github_actions_key"

if [ ! -f "$SSH_KEY_PATH" ]; then
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    ssh-keygen -t ed25519 -C "github-actions" -f "$SSH_KEY_PATH" -N ""
    
    # Add to authorized_keys
    cat "${SSH_KEY_PATH}.pub" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    
    echo -e "${GREEN}✓ SSH key generated${NC}"
else
    echo -e "${GREEN}✓ SSH key already exists${NC}"
fi

echo ""
echo -e "${RED}⚠️  IMPORTANT: Copy this private key to GitHub Secrets${NC}"
echo "=================================================="
cat "$SSH_KEY_PATH"
echo "=================================================="
echo ""
echo "Go to: https://github.com/muhammadrizkyqh/lppmv1/settings/secrets/actions"
echo "Update VPS_SSH_KEY with the key above"
echo ""
read -p "Press Enter after updating GitHub Secret..."

echo ""
echo -e "${YELLOW}Step 5: Setup Project Directory${NC}"
echo "================================"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "Cloning repository..."
    git clone https://github.com/muhammadrizkyqh/lppmv1.git "$PROJECT_DIR"
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${GREEN}✓ Project directory exists${NC}"
fi

cd "$PROJECT_DIR"

echo ""
echo -e "${YELLOW}Step 6: Setup Environment File${NC}"
echo "==============================="

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "Creating .env template..."
    cat > "$PROJECT_DIR/.env" << 'EOF'
# Database
DATABASE_URL="mysql://lppm_user:YOUR_PASSWORD@localhost:3306/lppm_db"

# Auth
NEXTAUTH_SECRET="REPLACE_WITH_RANDOM_SECRET"
NEXTAUTH_URL="http://stai-ali.com"

# Environment
NODE_ENV="production"

# Upload Directory (for standalone mode if needed)
UPLOAD_DIR="/home/deploy/lppmv1/public/uploads"
EOF
    
    echo -e "${YELLOW}⚠️  Please edit .env file and set proper values:${NC}"
    echo "   nano $PROJECT_DIR/.env"
    echo ""
    echo "Generate NEXTAUTH_SECRET with: openssl rand -base64 32"
    echo ""
    read -p "Press Enter after editing .env..."
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 7: Create Required Directories${NC}"
echo "===================================="

mkdir -p "$PROJECT_DIR/public/uploads"
mkdir -p "$PROJECT_DIR/node_modules"
mkdir -p "$PROJECT_DIR/.next"

echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${YELLOW}Step 8: Set Proper Permissions${NC}"
echo "==============================="

chown -R deploy:deploy "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR/public/uploads"

echo -e "${GREEN}✓ Permissions set${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  ✓ Node.js ${NODE_VERSION} installed"
echo "  ✓ PM2 installed and configured"
echo "  ✓ SSH key for GitHub Actions generated"
echo "  ✓ Project directory ready"
echo "  ✓ Environment file created"
echo ""
echo -e "${RED}⚠️  NEXT STEPS:${NC}"
echo ""
echo "1. Update GitHub Secrets:"
echo "   - VPS_SSH_KEY: Already shown above"
echo ""
echo "2. Setup MySQL Database:"
echo "   sudo mysql"
echo "   CREATE DATABASE lppm_db;"
echo "   CREATE USER 'lppm_user'@'localhost' IDENTIFIED BY 'password';"
echo "   GRANT ALL PRIVILEGES ON lppm_db.* TO 'lppm_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. Restore Database (if have backup):"
echo "   mysql -u lppm_user -p lppm_db < ~/backup.sql"
echo ""
echo "4. Edit .env file:"
echo "   nano $PROJECT_DIR/.env"
echo ""
echo "5. Test GitHub Actions:"
echo "   git commit --allow-empty -m 'test: trigger CI/CD'"
echo "   git push origin master"
echo ""
echo "6. Monitor deployment:"
echo "   https://github.com/muhammadrizkyqh/lppmv1/actions"
echo ""
echo -e "${GREEN}🎉 Setup completed at: $(date)${NC}"
