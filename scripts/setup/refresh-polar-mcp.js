#!/usr/bin/env node

/**
 * Refresh Polar MCP Configuration
 * 
 * Updates .mcp.json with token from .env file
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { validateEnvVars } = require('../utils/security');

// Validate environment variables
try {
  validateEnvVars(['POLAR_API_TOKEN']);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nPlease set POLAR_API_TOKEN in your .env file');
  console.error('Get your token from: https://polar.sh/settings/api\n');
  process.exit(1);
}

const POLAR_API_TOKEN = process.env.POLAR_API_TOKEN;
const mcpConfigPath = path.join(__dirname, '../../.mcp.json');

// Validate token format
if (!POLAR_API_TOKEN.startsWith('polar_')) {
  console.error('⚠️  Warning: Token does not start with "polar_"');
  console.error('   This may not be a valid Polar token\n');
}

// Create backup if config exists
if (fs.existsSync(mcpConfigPath)) {
  const backupPath = `${mcpConfigPath}.backup.${Date.now()}`;
  fs.copyFileSync(mcpConfigPath, backupPath);
  console.log(`📋 Created backup: ${backupPath}\n`);
}

// Update .mcp.json
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

fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));

console.log('✅ Updated .mcp.json with token from .env');
console.log(`   Token: ${POLAR_API_TOKEN.substring(0, 10)}...${POLAR_API_TOKEN.substring(POLAR_API_TOKEN.length - 4)}\n`);
console.log('⚠️  Note: You may need to restart Cursor for MCP changes to take effect\n');
