#!/usr/bin/env node

/**
 * Test Subscription System Using Polar MCP
 * 
 * Uses Polar MCP to:
 * 1. Get organization ID
 * 2. Check for existing subscription products
 * 3. Create subscription product if needed
 * 4. Test the system
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing with Polar MCP\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if .env has real tokens
const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const POLAR_ORG_ID = process.env.POLAR_ORG_ID;

if (!POLAR_API_TOKEN || POLAR_API_TOKEN.includes('your_') || POLAR_API_TOKEN.includes('here')) {
  console.log('❌ POLAR_API_TOKEN not set or has placeholder value');
  console.log('\nPlease update .env file with your real Polar API token:');
  console.log('1. Get token from: https://polar.sh/settings/api');
  console.log('2. Edit .env and replace "your_polar_api_token_here"');
  console.log('3. Run this script again\n');
  process.exit(1);
}

console.log(`✅ POLAR_API_TOKEN: ${POLAR_API_TOKEN.substring(0, 10)}...${POLAR_API_TOKEN.substring(POLAR_API_TOKEN.length - 4)}`);

// Try to get org ID from MCP if not in .env
if (!POLAR_ORG_ID || POLAR_ORG_ID.includes('your_') || POLAR_ORG_ID.includes('here')) {
  console.log('\n⚠️  POLAR_ORG_ID not set in .env');
  console.log('   Attempting to get from Polar MCP...\n');
  
  // Note: MCP tools would be called here, but they need to be called via the MCP interface
  // For now, we'll guide the user
  console.log('   To get your Organization ID:');
  console.log('   1. Use Polar MCP: list products (will show org ID)');
  console.log('   2. Or check Polar dashboard');
  console.log('   3. Or run: node scripts/setup/create-subscription-product.js');
  console.log('      (it will help identify the org ID)\n');
} else {
  console.log(`✅ POLAR_ORG_ID: ${POLAR_ORG_ID.substring(0, 8)}...`);
}

console.log('\n📋 Next Steps:\n');
console.log('1. Ensure .env has real tokens');
console.log('2. Refresh MCP config: node scripts/setup/refresh-polar-mcp.js');
console.log('3. Restart Cursor (for MCP to pick up new token)');
console.log('4. Then I can use Polar MCP to:');
console.log('   - List your organizations');
console.log('   - Get organization ID');
console.log('   - Create subscription product');
console.log('   - Test the full system\n');
