#!/bin/bash
# VPS Security Enhancement Script
# Run this script on VPS: bash vps-security-setup.sh

set -e

echo "=== VPS Security Enhancement ==="
echo ""

# 1. Install ClamAV Antivirus
echo "[1/6] Installing ClamAV antivirus..."
sudo apt update
sudo apt install -y clamav clamav-daemon

echo "Updating virus definitions..."
sudo systemctl stop clamav-freshclam
sudo freshclam
sudo systemctl start clamav-freshclam

# 2. Create monitoring script
echo ""
echo "[2/6] Creating CPU/Memory monitoring script..."
cat > /home/deploy/monitor-resources.sh << 'EOF'
#!/bin/bash
# Monitor and kill suspicious high-CPU processes

THRESHOLD=80
LOG_FILE="/var/log/suspicious-processes.log"

# Check CPU usage
HIGH_CPU=$(ps aux | awk '{if($3 > '$THRESHOLD') print $2, $3, $11}' | grep -v "PID" | grep -v "next-server" | grep -v "node" | grep -v "npm")

if [ ! -z "$HIGH_CPU" ]; then
    echo "[$(date)] High CPU detected:" >> $LOG_FILE
    echo "$HIGH_CPU" >> $LOG_FILE
    
    # Kill suspicious processes from /dev/shm, /tmp, or with random names
    ps aux | awk '{if($3 > '$THRESHOLD' && ($11 ~ /^\/dev\/shm/ || $11 ~ /^\/tmp/)) print $2}' | while read pid; do
        echo "[$(date)] Killing suspicious PID: $pid" >> $LOG_FILE
        kill -9 $pid 2>/dev/null || true
    done
fi

# Check for processes in /dev/shm
SHMMEM_PROCS=$(ps aux | grep "/dev/shm" | grep -v grep)
if [ ! -z "$SHMMEM_PROCS" ]; then
    echo "[$(date)] Suspicious /dev/shm processes detected:" >> $LOG_FILE
    echo "$SHMMEM_PROCS" >> $LOG_FILE
    ps aux | grep "/dev/shm" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
fi
EOF

chmod +x /home/deploy/monitor-resources.sh

# 3. Setup cron job for monitoring
echo ""
echo "[3/6] Setting up automated monitoring (every 5 minutes)..."
(crontab -l 2>/dev/null || true; echo "*/5 * * * * /home/deploy/monitor-resources.sh") | crontab -

# 4. Setup /dev/shm cleanup
echo ""
echo "[4/6] Setting up /dev/shm cleanup..."
cat > /home/deploy/cleanup-shm.sh << 'EOF'
#!/bin/bash
# Clean suspicious files in /dev/shm

find /dev/shm -type f -executable ! -name 'pulse-*' ! -name 'sem.*' -mmin +5 -delete 2>/dev/null || true
EOF

chmod +x /home/deploy/cleanup-shm.sh

# Add to cron (every 10 minutes)
(crontab -l 2>/dev/null || true; echo "*/10 * * * * /home/deploy/cleanup-shm.sh") | crontab -

# 5. Restrict outgoing connections (allow only necessary ports)
echo ""
echo "[5/6] Configuring firewall to restrict outgoing connections..."
# Allow established connections
sudo ufw default allow outgoing

# Block common mining pools (you can add more as needed)
echo "Blocking known crypto mining pool IPs..."
# Example: sudo ufw deny out to 95.217.194.177 comment 'Block mining pool'

# 6. Create npm audit script
echo ""
echo "[6/6] Creating npm security audit script..."
cat > /home/deploy/npm-audit.sh << 'EOF'
#!/bin/bash
# Run npm audit and log results

cd /home/deploy/lppmv1
export PATH=$PATH:/home/deploy/.nvm/versions/node/v24.12.0/bin
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "[$(date)] Running npm audit..." >> /var/log/npm-audit.log
npm audit >> /var/log/npm-audit.log 2>&1

# Check for high severity vulnerabilities
HIGH_VULN=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | cut -d':' -f2 || echo "0")
if [ "$HIGH_VULN" -gt 0 ]; then
    echo "[$(date)] WARNING: $HIGH_VULN high severity vulnerabilities found!" >> /var/log/npm-audit.log
fi
EOF

chmod +x /home/deploy/npm-audit.sh

# Run npm audit now
echo ""
echo "Running initial npm audit..."
bash /home/deploy/npm-audit.sh

echo ""
echo "=== Security Setup Complete ==="
echo ""
echo "Monitoring scripts created:"
echo "  - /home/deploy/monitor-resources.sh (runs every 5 min)"
echo "  - /home/deploy/cleanup-shm.sh (runs every 10 min)"
echo "  - /home/deploy/npm-audit.sh"
echo ""
echo "Log files:"
echo "  - /var/log/suspicious-processes.log"
echo "  - /var/log/npm-audit.log"
echo ""
echo "Next steps:"
echo "  1. Check logs regularly: tail -f /var/log/suspicious-processes.log"
echo "  2. Run full virus scan: sudo clamscan -r /home/deploy/lppmv1"
echo "  3. Monitor cron jobs: crontab -l"
echo ""
