#!/usr/bin/env node

/**
 * Test API endpoints by simulating Vercel serverless function calls
 */

require('dotenv').config();

console.log('🧪 Testing API Endpoints\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Simulate Vercel request/response
function createVercelHandler(modulePath) {
  return async (req, res) => {
    try {
      const handler = require(modulePath);
      const result = await handler.default(req, res);
      return result;
    } catch (error) {
      console.error(`Error in ${modulePath}:`, error.message);
      throw error;
    }
  };
}

// Test 1: Catalog Version
console.log('1. Testing Catalog Version Endpoint...\n');
try {
  const versionHandler = require('../api/v1/catalog/version.js');
  
  // Simulate Vercel request
  const mockReq = { query: {} };
  const mockRes = {
    status: (code) => ({
      json: (data) => ({ statusCode: code, body: data })
    }),
    json: (data) => ({ statusCode: 200, body: data })
  };
  
  const result = await versionHandler.default(mockReq, mockRes);
  console.log('✅ Catalog Version:', JSON.stringify(result, null, 2));
  console.log('');
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test 2: User Entitlements
console.log('2. Testing User Entitlements Endpoint...\n');
try {
  const entitlementsHandler = require('../api/v1/user/entitlements.js');
  
  const mockReq = { query: { customer_id: 'test_customer_123' } };
  const mockRes = {
    status: (code) => ({
      json: (data) => ({ statusCode: code, body: data })
    }),
    json: (data) => ({ statusCode: 200, body: data })
  };
  
  const result = await entitlementsHandler.default(mockReq, mockRes);
  console.log('✅ User Entitlements:', JSON.stringify(result, null, 2));
  console.log('');
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ API endpoint tests complete\n');



