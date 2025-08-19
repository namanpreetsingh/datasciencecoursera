import autocannon from 'autocannon';
import { performance } from 'perf_hooks';

// Benchmark configuration
const config = {
  url: 'http://localhost:3000',
  connections: 100,
  duration: 10,
  pipelining: 1,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Performance test data
const testData = {
  data: Array.from({ length: 1000 }, (_, i) => Math.random() * 100),
  iterations: 1000
};

// Benchmark functions
async function benchmarkHealth() {
  console.log('🏥 Benchmarking health endpoint...');
  const result = await autocannon({
    ...config,
    url: `${config.url}/health`,
    method: 'GET',
  });
  
  console.log(`Health endpoint: ${result.requests.average} req/sec`);
  return result;
}

async function benchmarkPerformance() {
  console.log('⚡ Benchmarking performance endpoint...');
  const result = await autocannon({
    ...config,
    url: `${config.url}/performance`,
    method: 'GET',
  });
  
  console.log(`Performance endpoint: ${result.requests.average} req/sec`);
  return result;
}

async function benchmarkCompute() {
  console.log('🧮 Benchmarking compute endpoint...');
  const result = await autocannon({
    ...config,
    url: `${config.url}/compute`,
    method: 'POST',
    body: JSON.stringify(testData),
  });
  
  console.log(`Compute endpoint: ${result.requests.average} req/sec`);
  return result;
}

async function benchmarkConcurrent() {
  console.log('🔄 Benchmarking concurrent requests...');
  const result = await autocannon({
    ...config,
    connections: 200,
    duration: 15,
    url: `${config.url}/health`,
    method: 'GET',
  });
  
  console.log(`Concurrent requests: ${result.requests.average} req/sec`);
  return result;
}

async function benchmarkMemory() {
  console.log('💾 Memory usage test...');
  const startMemory = process.memoryUsage();
  
  // Simulate heavy load
  const promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(
      fetch(`${config.url}/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [1, 2, 3], iterations: 100 })
      })
    );
  }
  
  await Promise.all(promises);
  
  const endMemory = process.memoryUsage();
  const memoryDiff = {
    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    external: endMemory.external - startMemory.external,
  };
  
  console.log('Memory usage difference:', {
    heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryDiff.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memoryDiff.external / 1024 / 1024).toFixed(2)} MB`,
  });
  
  return memoryDiff;
}

async function runAllBenchmarks() {
  console.log('🚀 Starting comprehensive performance benchmarks...\n');
  
  const startTime = performance.now();
  
  try {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = {
      health: await benchmarkHealth(),
      performance: await benchmarkPerformance(),
      compute: await benchmarkCompute(),
      concurrent: await benchmarkConcurrent(),
      memory: await benchmarkMemory(),
    };
    
    const totalTime = performance.now() - startTime;
    
    console.log('\n📊 Benchmark Summary:');
    console.log('=====================');
    console.log(`Total benchmark time: ${totalTime.toFixed(2)}ms`);
    console.log(`Health endpoint: ${results.health.requests.average.toFixed(2)} req/sec`);
    console.log(`Performance endpoint: ${results.performance.requests.average.toFixed(2)} req/sec`);
    console.log(`Compute endpoint: ${results.compute.requests.average.toFixed(2)} req/sec`);
    console.log(`Concurrent requests: ${results.concurrent.requests.average.toFixed(2)} req/sec`);
    
    // Performance analysis
    const avgLatency = (results.health.latency.average + 
                       results.performance.latency.average + 
                       results.compute.latency.average) / 3;
    
    console.log(`\n🎯 Performance Metrics:`);
    console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`Total requests: ${results.health.requests.total + 
                                   results.performance.requests.total + 
                                   results.compute.requests.total}`);
    
    // Recommendations
    console.log(`\n💡 Optimization Recommendations:`);
    if (avgLatency > 100) {
      console.log('- Consider implementing caching for frequently accessed data');
      console.log('- Review database query optimization');
      console.log('- Implement connection pooling if using databases');
    }
    
    if (results.compute.requests.average < 50) {
      console.log('- Consider using worker threads for heavy computations');
      console.log('- Implement request queuing for compute-intensive operations');
    }
    
    if (results.concurrent.requests.average < 100) {
      console.log('- Review server configuration and connection limits');
      console.log('- Consider load balancing for high traffic scenarios');
    }
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    console.log('Make sure the server is running on http://localhost:3000');
  }
}

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBenchmarks();
}

export { runAllBenchmarks, benchmarkHealth, benchmarkPerformance, benchmarkCompute };