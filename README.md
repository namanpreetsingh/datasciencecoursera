# 🚀 Optimized Node.js Application

A high-performance, production-ready Node.js application with comprehensive optimizations, clustering, monitoring, and benchmarking capabilities.

## ✨ Features

- **🚀 Performance Optimized**: Clustering, compression, rate limiting, and memory management
- **🔄 Auto-scaling**: Automatic worker process management with PM2
- **📊 Monitoring**: Built-in performance monitoring and health checks
- **🧪 Benchmarking**: Comprehensive performance testing suite
- **🐳 Docker Ready**: Multi-stage Docker builds with production optimizations
- **📈 Metrics**: Prometheus and Grafana integration
- **🔒 Security**: Helmet, CORS, and rate limiting protection
- **📝 Logging**: Structured logging with Pino

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Nginx Proxy   │    │   Application   │
│   (Optional)    │───▶│   (Optional)    │───▶│   Cluster       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │    │   Monitoring    │
                       │   (Cache/Queue) │    │   (Prometheus)  │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)
- Redis (optional, for production)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd optimized-node-app
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run prod
   
   # With PM2 (recommended for production)
   pm2 start ecosystem.config.js --env production
   ```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

## 📊 Performance Testing

### Run Benchmarks

```bash
# Start the application first
npm start

# Run comprehensive benchmarks
npm run benchmark

# Run specific benchmarks
node src/benchmark.js
```

### Expected Performance

- **Health Check**: 10,000+ req/sec
- **Performance Endpoint**: 8,000+ req/sec  
- **Compute Endpoint**: 500+ req/sec (varies with data size)
- **Memory Usage**: < 100MB under normal load

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server port |
| `MAX_OLD_SPACE_SIZE` | `4096` | Node.js heap size (MB) |
| `RATE_LIMIT_POINTS` | `100` | Requests per minute |
| `COMPRESSION_LEVEL` | `6` | Gzip compression level |

### Performance Tuning

```bash
# Increase heap size
export NODE_OPTIONS="--max-old-space-size=8192"

# Enable profiling
npm run profile

# Monitor with Clinic.js
npx clinic doctor -- node src/app.js
```

## 🔧 Development

### Scripts

```bash
npm run dev          # Development with hot reload
npm run start        # Production start
npm run prod         # Production with optimizations
npm run benchmark    # Run performance tests
npm run test         # Run tests
npm run lint         # Lint code
npm run profile      # CPU profiling
```

### Code Structure

```
src/
├── app.js           # Main application
├── benchmark.js     # Performance testing
└── tests/           # Test files

config/
├── ecosystem.config.js  # PM2 configuration
└── nginx.conf          # Nginx configuration

monitoring/
├── prometheus.yml      # Metrics configuration
└── grafana/           # Dashboard configurations
```

## 📈 Monitoring & Observability

### Health Checks

- **Endpoint**: `/health`
- **Response**: Application status, memory usage, uptime
- **Monitoring**: Auto-restart on failure

### Metrics

- **Prometheus**: Available at `http://localhost:9090`
- **Grafana**: Available at `http://localhost:3002`
- **PM2**: Process monitoring at `http://localhost:8080`

### Logging

```javascript
// Structured logging with Pino
logger.info({
  method: req.method,
  url: req.url,
  duration: '45ms',
  status: 200
});
```

## 🚀 Production Deployment

### PM2 (Recommended)

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Graceful restart
pm2 reload all
```

### Docker Production

```bash
# Build production image
docker build --target production -t optimized-app:prod .

# Run with Docker
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --name optimized-app \
  optimized-app:prod
```

### Load Balancing

```bash
# Scale horizontally
pm2 scale optimized-node-app 4

# Or with Docker
docker-compose up -d --scale app=4
```

## 🔍 Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check memory usage
   pm2 monit
   
   # Increase heap size
   export NODE_OPTIONS="--max-old-space-size=8192"
   ```

2. **Performance Issues**
   ```bash
   # Run benchmarks
   npm run benchmark
   
   # Profile CPU usage
   npm run profile
   ```

3. **Worker Crashes**
   ```bash
   # Check logs
   pm2 logs
   
   # Restart workers
   pm2 reload all
   ```

### Performance Tips

- **Use clustering** for CPU-intensive applications
- **Implement caching** for frequently accessed data
- **Monitor memory usage** and set appropriate limits
- **Use compression** for large responses
- **Implement rate limiting** to prevent abuse
- **Use worker threads** for heavy computations

## 📚 API Endpoints

### Health Check
```http
GET /health
```

### Performance Test
```http
GET /performance
```

### Compute
```http
POST /compute
Content-Type: application/json

{
  "data": [1, 2, 3, 4, 5],
  "iterations": 1000
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Node.js team for the excellent runtime
- Express.js for the web framework
- PM2 for process management
- Docker for containerization
- Prometheus & Grafana for monitoring

---

**Built with ❤️ for high-performance Node.js applications**