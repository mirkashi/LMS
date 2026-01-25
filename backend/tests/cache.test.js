/**
 * Cache System Tests
 * Run with: node backend/tests/cache.test.js
 */

const cacheService = require('../services/cacheService');

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🧪 Cache System Tests${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Wait for cache to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Basic Set and Get
  console.log(`${colors.yellow}Test Suite: Basic Operations${colors.reset}`);
  const testKey = 'test:key:1';
  const testValue = { name: 'Test Course', price: 99.99 };
  await cacheService.set(testKey, testValue, 60);
  const retrieved = await cacheService.get(testKey);
  assert(
    retrieved && retrieved.name === 'Test Course',
    'Should set and get cache value'
  );

  // Test 2: Cache Miss
  const nonExistent = await cacheService.get('non:existent:key');
  assert(nonExistent === null, 'Should return null for non-existent key');

  // Test 3: Delete Key
  await cacheService.del(testKey);
  const afterDelete = await cacheService.get(testKey);
  assert(afterDelete === null, 'Should delete cache key');

  // Test 4: Set Multiple Keys with Pattern
  console.log(`\n${colors.yellow}Test Suite: Pattern Operations${colors.reset}`);
  await cacheService.set('courses:1', { id: 1, name: 'Course 1' }, 60);
  await cacheService.set('courses:2', { id: 2, name: 'Course 2' }, 60);
  await cacheService.set('courses:3', { id: 3, name: 'Course 3' }, 60);
  await cacheService.set('products:1', { id: 1, name: 'Product 1' }, 60);

  // Test 5: Delete by Pattern
  const deletedCount = await cacheService.deletePattern('courses:*');
  assert(deletedCount >= 3, `Should delete multiple keys by pattern (deleted: ${deletedCount})`);

  // Test 6: Verify Pattern Delete
  const course1 = await cacheService.get('courses:1');
  const product1 = await cacheService.get('products:1');
  assert(
    course1 === null && product1 !== null,
    'Pattern delete should only affect matching keys'
  );

  // Test 7: Clear by Type
  console.log(`\n${colors.yellow}Test Suite: Clear by Type${colors.reset}`);
  await cacheService.set('products:test1', { id: 1 }, 60);
  await cacheService.set('products:test2', { id: 2 }, 60);
  const clearResult = await cacheService.clearByType('products');
  assert(clearResult.success, 'Should clear cache by type');
  assert(clearResult.deletedCount >= 2, `Should delete correct count (deleted: ${clearResult.deletedCount})`);

  // Test 8: Clear Shop Cache
  console.log(`\n${colors.yellow}Test Suite: Composite Cache Operations${colors.reset}`);
  await cacheService.set('products:shop1', { id: 1 }, 60);
  await cacheService.set('shop:page1', { data: [] }, 60);
  const shopResults = await cacheService.clearShopCache();
  assert(
    Array.isArray(shopResults) && shopResults.length > 0,
    'Should clear shop-related caches'
  );

  // Test 9: Clear Course Cache
  await cacheService.set('courses:list', [], 60);
  await cacheService.set('course:101', { id: 101 }, 60);
  const courseResults = await cacheService.clearCourseCache();
  assert(
    Array.isArray(courseResults) && courseResults.length > 0,
    'Should clear course-related caches'
  );

  // Test 10: Clear Multiple Types
  console.log(`\n${colors.yellow}Test Suite: Multiple Type Operations${colors.reset}`);
  await cacheService.set('orders:1', { id: 1 }, 60);
  await cacheService.set('payments:1', { id: 1 }, 60);
  const multiResults = await cacheService.clearMultiple(['orders', 'payments']);
  assert(
    Array.isArray(multiResults) && multiResults.length === 2,
    'Should clear multiple cache types'
  );

  // Test 11: Cache Statistics
  console.log(`\n${colors.yellow}Test Suite: Statistics and Monitoring${colors.reset}`);
  const stats = cacheService.getStats();
  assert(
    stats.provider && stats.stats && stats.stats.hits !== undefined,
    'Should return cache statistics'
  );
  assert(stats.stats.hitRate !== undefined, 'Should calculate hit rate');

  // Test 12: Health Check
  const health = await cacheService.healthCheck();
  assert(
    health.healthy !== undefined && health.provider !== undefined,
    'Should perform health check'
  );
  assert(health.timestamp !== undefined, 'Health check should include timestamp');

  // Test 13: TTL Expiration (quick test)
  console.log(`\n${colors.yellow}Test Suite: TTL and Expiration${colors.reset}`);
  await cacheService.set('ttl:test', { data: 'test' }, 2); // 2 seconds TTL
  const immediate = await cacheService.get('ttl:test');
  assert(immediate !== null, 'Should get value immediately after set');
  
  console.log('   Waiting 3 seconds for TTL expiration...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  const expired = await cacheService.get('ttl:test');
  assert(expired === null, 'Should return null after TTL expires');

  // Test 14: Cache Key Generation
  console.log(`\n${colors.yellow}Test Suite: Edge Cases${colors.reset}`);
  try {
    await cacheService.clearByType('invalid_type');
    assert(false, 'Should throw error for invalid cache type');
  } catch (error) {
    assert(true, 'Should throw error for invalid cache type');
  }

  // Test 15: Large Data Caching
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: 'A'.repeat(100),
  }));
  await cacheService.set('large:data', largeData, 60);
  const retrievedLarge = await cacheService.get('large:data');
  assert(
    retrievedLarge && retrievedLarge.length === 1000,
    'Should handle large data sets'
  );

  // Test 16: Flush All
  console.log(`\n${colors.yellow}Test Suite: Flush Operations${colors.reset}`);
  await cacheService.set('test:1', { data: 1 }, 60);
  await cacheService.set('test:2', { data: 2 }, 60);
  const flushed = await cacheService.flushAll();
  assert(flushed === true, 'Should flush all cache');
  const afterFlush = await cacheService.get('test:1');
  assert(afterFlush === null, 'Cache should be empty after flush');

  // Final Results
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 Test Results${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log(
    `Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`
  );
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Final Stats
  console.log(`${colors.blue}📈 Final Cache Statistics:${colors.reset}`);
  const finalStats = cacheService.getStats();
  console.log(JSON.stringify(finalStats, null, 2));

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
console.log('\nStarting cache system tests...\n');
runTests().catch((error) => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, error);
  process.exit(1);
});
