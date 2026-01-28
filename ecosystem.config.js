module.exports = {
  apps: [{
    name: 'lppm',
    script: './server.js', // Standalone server
    instances: 1,
    exec_mode: 'cluster',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/.pm2/logs/lppm-error.log',
    out_file: '/home/deploy/.pm2/logs/lppm-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    watch: false
  }]
}
