import { test } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import { app } from './app.js';

// Mock the cluster module for testing
const originalCluster = await import('cluster');
const mockCluster = {
  isPrimary: false,
  fork: () => {},
  on: () => {},
  workers: {}
};

// Test the heavy computation function
test('performHeavyComputation function', async (t) => {
  await t.test('should handle empty array', async () => {
    const result = await performHeavyComputation([], 100);
    assert.deepStrictEqual(result, []);
  });

  await t.test('should handle single item', async () => {
    const result = await performHeavyComputation([5], 10);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(typeof result[0], 'number');
  });

  await t.test('should handle multiple items', async () => {
    const data = [1, 2, 3];
    const result = await performHeavyComputation(data, 100);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(typeof result[0], 'number');
  });
});

// Test health endpoint
test('health endpoint', async (t) => {
  await t.test('should return health status', async () => {
    const server = createServer(app);
    const port = 0; // Let OS assign port
    
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        const address = server.address();
        const url = `http://localhost:${address.port}/health`;
        
        fetch(url)
          .then(response => response.json())
          .then(data => {
            assert.strictEqual(data.status, 'OK');
            assert.strictEqual(typeof data.timestamp, 'string');
            assert.strictEqual(typeof data.uptime, 'number');
            server.close();
            resolve();
          })
          .catch(reject);
      });
    });
  });
});

// Test performance endpoint
test('performance endpoint', async (t) => {
  await t.test('should return performance metrics', async () => {
    const server = createServer(app);
    const port = 0;
    
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        const address = server.address();
        const url = `http://localhost:${address.port}/performance`;
        
        fetch(url)
          .then(response => response.json())
          .then(data => {
            assert.strictEqual(typeof data.message, 'string');
            assert.strictEqual(typeof data.duration, 'string');
            assert.strictEqual(typeof data.worker, 'number');
            assert.strictEqual(typeof data.timestamp, 'string');
            server.close();
            resolve();
          })
          .catch(reject);
      });
    });
  });
});

// Test compute endpoint
test('compute endpoint', async (t) => {
  await t.test('should handle valid computation request', async () => {
    const server = createServer(app);
    const port = 0;
    
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        const address = server.address();
        const url = `http://localhost:${address.port}/compute`;
        
        const testData = {
          data: [1, 2, 3],
          iterations: 100
        };
        
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        })
          .then(response => response.json())
          .then(data => {
            assert.strictEqual(Array.isArray(data.result), true);
            assert.strictEqual(data.result.length, 3);
            assert.strictEqual(typeof data.duration, 'string');
            assert.strictEqual(data.iterations, 100);
            assert.strictEqual(data.dataSize, 3);
            server.close();
            resolve();
          })
          .catch(reject);
      });
    });
  });

  await t.test('should handle invalid data', async () => {
    const server = createServer(app);
    const port = 0;
    
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        const address = server.address();
        const url = `http://localhost:${address.port}/compute`;
        
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' })
        })
          .then(response => response.json())
          .then(data => {
            assert.strictEqual(data.error, 'Invalid data provided');
            server.close();
            resolve();
          })
          .catch(reject);
      });
    });
  });
});

// Test error handling
test('error handling', async (t) => {
  await t.test('should handle 404 routes', async () => {
    const server = createServer(app);
    const port = 0;
    
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        const address = server.address();
        const url = `http://localhost:${address.port}/nonexistent`;
        
        fetch(url)
          .then(response => response.json())
          .then(data => {
            assert.strictEqual(data.error, 'Route not found');
            server.close();
            resolve();
          })
          .catch(reject);
      });
    });
  });
});

console.log('🧪 Running tests...');