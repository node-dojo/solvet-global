#!/usr/bin/env node

/**
 * Test API endpoints directly (without Vercel dev server)
 * Tests the serverless functions directly
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing API Endpoints Directly\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test catalog version endpoint
console.log('1. Testing Catalog Version Endpoint...\n');
try {
  const catalogVersion = require('../api/v1/catalog/version.js');
  console.log('✅ Catalog version endpoint loaded');
  console.log('   File exists and can be imported\n');
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test user entitlements endpoint
console.log('2. Testing User Entitlements Endpoint...\n');
try {
  const entitlements = require('../api/v1/user/entitlements.js');
  console.log('✅ User entitlements endpoint loaded');
  console.log('   File exists and can be imported\n');
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Test library download endpoint
console.log('3. Testing Library Download Endpoint...\n');
try {
  const download = require('../api/v1/library/download.js');
  console.log('✅ Library download endpoint loaded');
  console.log('   File exists and can be imported\n');
} catch (error) {
  console.log(`❌ Error: ${error.message}\n`);
}

// Check environment variables
console.log('4. Checking Environment Variables...\n');
const requiredVars = ['POLAR_API_TOKEN', 'POLAR_ORG_ID', 'GITHUB_TOKEN'];
let allPresent = true;

for (const varName of requiredVars) {
  if (process.env[varName] && !process.env[varName].includes('your_')) {
    console.log(`   ✅ ${varName}: Set`);
  } else {
    console.log(`   ❌ ${varName}: Missing or placeholder`);
    allPresent = false;
  }
}
console.log('');

// Test Polar API connection
console.log('5. Testing Polar API Connection...\n');
try {
  const { Polar } = require('@polar-sh/sdk');
  const polar = new Polar({ accessToken: process.env.POLAR_API_TOKEN });
  
  polar.products.list({ organizationId: process.env.POLAR_ORG_ID, limit: 1 })
    .then(() => {
      console.log('   ✅ Polar API connection successful\n');
    })
    .catch(error => {
      console.log(`   ❌ Polar API error: ${error.message}\n`);
    });
} catch (error) {
  console.log(`   ❌ Error: ${error.message}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Summary:\n');
console.log('To test endpoints with Vercel dev:');
console.log('  1. Run: doppler run -- vercel dev --yes');
console.log('  2. Wait for server to start');
console.log('  3. Test: curl http://localhost:3000/api/v1/catalog/version');
console.log('');



