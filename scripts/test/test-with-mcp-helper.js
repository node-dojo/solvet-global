#!/usr/bin/env node

/**
 * Helper to Test with Polar MCP
 * 
 * Once .env has real tokens, this will:
 * 1. Refresh MCP config
 * 2. Use MCP to get organization info
 * 3. Test the subscription system
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔧 Polar MCP Testing Helper\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check .env
const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;

if (!POLAR_API_TOKEN || POLAR_API_TOKEN.includes('your_') || POLAR_API_TOKEN.includes('here')) {
  console.log('❌ POLAR_API_TOKEN not set in .env\n');
  console.log('📝 To use Polar MCP:\n');
  console.log('1. Get your Polar API token:');
  console.log('   https://polar.sh/settings/api\n');
  console.log('2. Edit .env file and add:');
  console.log('   POLAR_API_TOKEN=polar_oat_your_token_here\n');
  console.log('3. Run this script again\n');
  console.log('Once the token is set, I can:');
  console.log('- Refresh MCP configuration');
  console.log('- Use MCP to get your organization ID');
  console.log('- Create subscription products');
  console.log('- Test the full system\n');
  process.exit(0);
}

console.log('✅ POLAR_API_TOKEN found in .env\n');

// Refresh MCP config
console.log('🔄 Refreshing MCP configuration...\n');

const mcpConfigPath = path.join(__dirname, '../../.mcp.json');
const mcpConfig = {
  mcpServers: {
    Polar: {
      type: "http",
      url: "https://mcp.polar.sh/mcp/polar-mcp",
      headers: {
        Authorization: `Bearer ${POLAR_API_TOKEN}`
      }
    }
  }
};

if (fs.existsSync(mcpConfigPath)) {
  const backupPath = `${mcpConfigPath}.backup.${Date.now()}`;
  fs.copyFileSync(mcpConfigPath, backupPath);
  console.log(`📋 Created backup: ${backupPath}\n`);
}

fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
console.log('✅ Updated .mcp.json\n');

console.log('⚠️  IMPORTANT: Restart Cursor for MCP changes to take effect!\n');
console.log('After restarting Cursor, I can use Polar MCP to:');
console.log('- List your organizations');
console.log('- Get your organization ID');
console.log('- List existing products');
console.log('- Create subscription products');
console.log('- Test the subscription system\n');
console.log('Then run:');
console.log('  node scripts/setup/create-subscription-product.js');
console.log('  node scripts/test/subscription-system-test.js\n');
