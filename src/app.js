import cluster from 'cluster';
import os from 'os';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import pino from 'pino';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Performance optimizations
const numCPUs = os.cpus().length;
const isProduction = process.env.NODE_ENV === 'production';

// Configure logger with performance optimizations
const logger = pino({
  level: isProduction ? 'warn' : 'debug',
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Clustering for better performance
if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

} else {
  // Worker process
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Performance middleware
  app.use(compression({
    level: 6, // Balanced compression
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing with limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting middleware
  app.use(async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (rejRes) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      });
    }
  });

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      worker: process.pid
    });
  });

  // Performance test endpoint
  app.get('/performance', async (req, res) => {
    const start = performance.now();
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    const duration = performance.now() - start;
    res.json({
      message: 'Performance test completed',
      duration: `${duration.toFixed(2)}ms`,
      worker: process.pid,
      timestamp: new Date().toISOString()
    });
  });

  // Heavy computation endpoint with optimization
  app.post('/compute', async (req, res) => {
    const { data, iterations = 1000 } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    const start = performance.now();
    
    try {
      // Use worker threads for heavy computation in production
      const result = await performHeavyComputation(data, iterations);
      
      const duration = performance.now() - start;
      
      res.json({
        result,
        duration: `${duration.toFixed(2)}ms`,
        iterations,
        dataSize: data.length,
        worker: process.pid
      });
    } catch (error) {
      logger.error('Computation error:', error);
      res.status(500).json({ error: 'Computation failed' });
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      error: isProduction ? 'Internal Server Error' : err.message
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Start server with optimizations
  const server = app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} started on port ${PORT}`);
  });

  // Server optimizations
  server.keepAliveTimeout = 65000; // Slightly higher than ALB timeout
  server.headersTimeout = 66000;
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info(`Worker ${process.pid} shutting down gracefully`);
    server.close(() => {
      logger.info(`Worker ${process.pid} closed`);
      process.exit(0);
    });
  });
}

// Heavy computation function with optimizations
async function performHeavyComputation(data, iterations) {
  // Use efficient algorithms and avoid memory leaks
  const results = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    const item = data[i];
    
    // Optimized loop with minimal object creation
    for (let j = 0; j < iterations; j++) {
      sum += (item * j) / (j + 1);
    }
    
    results[i] = Math.round(sum * 100) / 100; // Round to 2 decimal places
  }
  
  return results;
}

// Performance monitoring
if (isProduction) {
  // Monitor memory usage
  setInterval(() => {
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
      logger.warn('High memory usage detected:', memUsage);
    }
  }, 30000); // Check every 30 seconds
}