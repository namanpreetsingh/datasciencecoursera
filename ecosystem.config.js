module.exports = {
  apps: [
    {
      name: 'optimized-node-app',
      script: 'src/app.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        MAX_OLD_SPACE_SIZE: 4096
      },
      // Performance optimizations
      node_args: [
        '--max-old-space-size=4096',
        '--optimize-for-size',
        '--max-semi-space-size=512'
      ],
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Monitoring
      pmx: true,
      // Auto restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Load balancing
      load_balancing_method: 'least-connection',
      // Health checks
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      // Environment variables
      env_file: '.env'
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-production-host',
      ref: 'origin/main',
      repo: 'git@github.com:username/optimized-node-app.git',
      path: '/var/www/optimized-node-app',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  },

  // Monitoring and metrics
  pmx: {
    http: true,
    http_default_route: true,
    http_route: '/pmx',
    http_port: 8080
  }
};