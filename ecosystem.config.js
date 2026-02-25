module.exports = {
  apps: [{
    name: 'knockoffdues',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/html/knockoffdues',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
      PORT: 3005, // Changed to 3005
      HOST: '0.0.0.0'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/www/html/knockoffdues/logs/err.log',
    out_file: '/var/www/html/knockoffdues/logs/out.log',
    log_file: '/var/www/html/knockoffdues/logs/combined.log',
    time: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: 10000,
    kill_timeout: 3000
  }]
}