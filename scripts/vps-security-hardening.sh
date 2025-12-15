#!/bin/bash
# VPS Security Hardening Script
# After crypto miner attack cleanup
# Run as: bash vps-security-hardening.sh

set -e

echo "🔒 VPS Security Hardening Script"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root: sudo bash vps-security-hardening.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Cleanup Crypto Miner Remnants${NC}"
echo "========================================"

# Kill any remaining miner processes
echo "Checking for miner processes..."
pkill -9 xmrig 2>/dev/null || true
pkill -9 monero 2>/dev/null || true
pkill -9 miner 2>/dev/null || true
pkill -9 kdevtmpfsi 2>/dev/null || true
echo -e "${GREEN}✓ Miner processes killed${NC}"

# Remove common miner directories
echo "Removing miner files..."
rm -rf /home/*/moneroocean 2>/dev/null || true
rm -rf /home/*/.xmrig 2>/dev/null || true
rm -rf /tmp/.xmrig* 2>/dev/null || true
rm -rf /tmp/xmrig* 2>/dev/null || true
rm -rf /var/tmp/.xmrig* 2>/dev/null || true
rm -rf /root/.config/cron 2>/dev/null || true
echo -e "${GREEN}✓ Miner files removed${NC}"

# Clean all crontabs
echo "Cleaning crontabs..."
crontab -r 2>/dev/null || true
for user in $(cut -f1 -d: /etc/passwd); do
    crontab -u $user -r 2>/dev/null || true
done
echo -e "${GREEN}✓ Crontabs cleaned${NC}"

# Check for suspicious systemd services
echo "Checking systemd services..."
systemctl list-units --type=service --state=running | grep -iE 'xmrig|monero|miner' && \
    echo -e "${RED}⚠ Found suspicious services!${NC}" || \
    echo -e "${GREEN}✓ No suspicious services${NC}"

echo ""
echo -e "${YELLOW}Step 2: SSH Hardening${NC}"
echo "======================"

# Backup original sshd_config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)
echo -e "${GREEN}✓ Backed up SSH config${NC}"

# Update SSH configuration
echo "Hardening SSH configuration..."
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config

# Add additional security settings
cat >> /etc/ssh/sshd_config << EOF

# Security hardening added $(date)
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers deploy
Protocol 2
EOF

echo -e "${GREEN}✓ SSH configuration hardened${NC}"

# Restart SSH
systemctl restart sshd
echo -e "${GREEN}✓ SSH service restarted${NC}"

echo ""
echo -e "${YELLOW}Step 3: Install & Configure Fail2Ban${NC}"
echo "======================================"

# Install fail2ban
if ! command -v fail2ban-client &> /dev/null; then
    echo "Installing fail2ban..."
    apt-get update -qq
    apt-get install -y fail2ban
    echo -e "${GREEN}✓ Fail2ban installed${NC}"
else
    echo -e "${GREEN}✓ Fail2ban already installed${NC}"
fi

# Configure fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
destemail = root@localhost
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo -e "${GREEN}✓ Fail2ban configured and started${NC}"

echo ""
echo -e "${YELLOW}Step 4: Firewall Configuration${NC}"
echo "==============================="

# Install ufw if not present
if ! command -v ufw &> /dev/null; then
    echo "Installing ufw..."
    apt-get install -y ufw
    echo -e "${GREEN}✓ UFW installed${NC}"
fi

# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 3000/tcp comment 'Next.js App'
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${YELLOW}Step 5: System Hardening${NC}"
echo "========================"

# Update system
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"

# Install security tools
echo "Installing security tools..."
apt-get install -y -qq \
    unattended-upgrades \
    apt-listchanges \
    rkhunter \
    chkrootkit
echo -e "${GREEN}✓ Security tools installed${NC}"

# Configure automatic security updates
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
echo -e "${GREEN}✓ Automatic security updates enabled${NC}"

# Disable unnecessary services
echo "Disabling unnecessary services..."
systemctl disable avahi-daemon 2>/dev/null || true
systemctl stop avahi-daemon 2>/dev/null || true
echo -e "${GREEN}✓ Unnecessary services disabled${NC}"

echo ""
echo -e "${YELLOW}Step 6: User & Permission Audit${NC}"
echo "================================"

# Check for unauthorized users
echo "Checking for unauthorized users..."
cat /etc/passwd | grep -v nologin | grep -v false | awk -F: '{print $1}'
echo -e "${GREEN}✓ User audit complete${NC}"

# Check for suspicious authorized_keys
echo "Checking SSH authorized keys..."
find /home -name authorized_keys -exec ls -la {} \;
find /root -name authorized_keys -exec ls -la {} \; 2>/dev/null || true
echo -e "${GREEN}✓ SSH keys audit complete${NC}"

# Set secure permissions
chmod 700 /home/deploy/.ssh 2>/dev/null || true
chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true
echo -e "${GREEN}✓ Permissions secured${NC}"

echo ""
echo -e "${YELLOW}Step 7: Network Security${NC}"
echo "========================"

# Disable IPv6 if not needed
cat >> /etc/sysctl.conf << EOF

# Security hardening
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.tcp_syncookies = 1
EOF

sysctl -p
echo -e "${GREEN}✓ Network security configured${NC}"

echo ""
echo -e "${YELLOW}Step 8: Monitoring Setup${NC}"
echo "========================"

# Create monitoring script
cat > /usr/local/bin/security-monitor.sh << 'EOF'
#!/bin/bash
# Security monitoring script

# Check for suspicious processes
ps aux | grep -iE 'xmrig|monero|miner|kdevtmpfsi' | grep -v grep && \
    echo "⚠ ALERT: Suspicious process detected!" | mail -s "Security Alert" root

# Check CPU usage
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU > 80" | bc -l) )); then
    echo "⚠ ALERT: High CPU usage: $CPU%" | mail -s "CPU Alert" root
fi

# Check memory
MEM=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
if (( $(echo "$MEM > 90" | bc -l) )); then
    echo "⚠ ALERT: High memory usage: $MEM%" | mail -s "Memory Alert" root
fi
EOF

chmod +x /usr/local/bin/security-monitor.sh

# Add to crontab (run every hour)
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/security-monitor.sh") | crontab -

echo -e "${GREEN}✓ Security monitoring configured${NC}"

echo ""
echo -e "${YELLOW}Step 9: Run Security Scans${NC}"
echo "==========================="

# Run rootkit hunter
echo "Running rootkit scan..."
rkhunter --update
rkhunter --check --skip-keypress --report-warnings-only || true
echo -e "${GREEN}✓ Rootkit scan complete${NC}"

# Run chkrootkit
echo "Running chkrootkit..."
chkrootkit -q || true
echo -e "${GREEN}✓ Chkrootkit scan complete${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Security Hardening Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  ✓ Crypto miner removed"
echo "  ✓ SSH hardened (password auth disabled)"
echo "  ✓ Fail2ban installed and configured"
echo "  ✓ Firewall enabled (UFW)"
echo "  ✓ Automatic security updates enabled"
echo "  ✓ Security monitoring setup"
echo "  ✓ System scanned for rootkits"
echo ""
echo -e "${RED}⚠ IMPORTANT NEXT STEPS:${NC}"
echo "  1. Verify SSH key access works before logout!"
echo "  2. Change password for 'deploy' user: passwd deploy"
echo "  3. Review rkhunter output: cat /var/log/rkhunter.log"
echo "  4. Test fail2ban: fail2ban-client status sshd"
echo "  5. Reboot VPS to apply all changes: sudo reboot"
echo ""
echo -e "${YELLOW}📊 Check Security Status:${NC}"
echo "  • SSH status: systemctl status sshd"
echo "  • Fail2ban status: fail2ban-client status"
echo "  • Firewall status: ufw status verbose"
echo "  • Memory usage: free -h"
echo "  • CPU usage: top -bn1 | head -20"
echo ""
echo -e "${GREEN}Script completed at: $(date)${NC}"
